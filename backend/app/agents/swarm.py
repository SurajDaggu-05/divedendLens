import uuid
from datetime import datetime, timezone, date, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.db.models import (
    Company, DividendEvent, EventSource, DataAlert, Holding, Portfolio,
    AgentState, AgentRun, AgentMessage, CalculationExplanation
)
from app.services.calculator import DividendCalculator, format_decimal
from app.agents.contracts import create_agent_message


class SwarmEngine:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_agent_state(self, agent_id: str, name: str, role: str) -> AgentState:
        state = self.db.query(AgentState).filter(AgentState.agent_id == agent_id).first()
        if not state:
            state = AgentState(
                agent_id=agent_id,
                name=name,
                role=role,
                status="online",
                last_heartbeat=datetime.now(timezone.utc),
                current_task="Idle",
                is_simulated=True,
            )
            self.db.add(state)
            self.db.commit()
        return state

    def log_run_and_message(
        self,
        task_id: str,
        correlation_id: str,
        agent_name: str,
        sender: str,
        recipient: str,
        message_type: str,
        summary: str,
        payload: Dict[str, Any],
        run_status: str = "completed"
    ) -> AgentRun:
        run = AgentRun(
            task_id=task_id,
            correlation_id=correlation_id,
            agent_name=agent_name,
            status=run_status,
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
            summary=summary,
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)

        msg_contract = create_agent_message(
            task_id=task_id,
            correlation_id=correlation_id,
            sender=sender,
            recipient=recipient,
            message_type=message_type,
            payload=payload,
        )

        msg = AgentMessage(
            run_id=run.id,
            correlation_id=correlation_id,
            sender=sender,
            recipient=recipient,
            message_type=message_type,
            schema_version="1.0",
            payload=msg_contract["payload"],
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(msg)
        self.db.commit()
        return run

    # ---------------------------------------------------------
    # 1. Data Collection Agent
    # ---------------------------------------------------------
    def run_collection(
        self,
        company: Company,
        correlation_id: str,
        task_id: str,
        primary_collector_id: str = "collector-agent-1"
    ) -> Dict[str, Any]:
        collector = self.db.query(AgentState).filter(AgentState.agent_id == primary_collector_id).first()
        
        # Monitoring check: is primary collector offline?
        if collector and collector.status == "offline":
            # Monitoring agent detects failure and reassigns task to standby collector
            standby_collector_id = "collector-agent-2"
            self.get_or_create_agent_state(
                standby_collector_id,
                "Standby Collection Agent",
                "Backup corporate action ingestion"
            )
            
            # Log failure detection & reassigned recovery
            self.log_run_and_message(
                task_id=f"{task_id}-reassigned",
                correlation_id=correlation_id,
                agent_name="Monitoring & Recovery Agent",
                sender="monitoring-recovery-agent-1",
                recipient=standby_collector_id,
                message_type="TASK_REASSIGNED",
                summary=f"Detected primary collector {primary_collector_id} offline. Reassigned task to {standby_collector_id}.",
                payload={"failed_agent_id": primary_collector_id, "reassigned_to": standby_collector_id},
                run_status="retrying"
            )

            actual_collector = standby_collector_id
            recovery_occurred = True
        else:
            actual_collector = primary_collector_id
            recovery_occurred = False
            if collector:
                collector.last_heartbeat = datetime.now(timezone.utc)
                collector.current_task = f"Ingesting disclosures for {company.ticker}"
                self.db.commit()

        # Ingest observations from seeded dividend events for company
        events = self.db.query(DividendEvent).filter(DividendEvent.company_id == company.id).all()
        observations = []
        for evt in events:
            sources = self.db.query(EventSource).filter(EventSource.event_id == evt.id).all()
            for src in sources:
                observations.append({
                    "event_id": evt.id,
                    "source_id": src.id,
                    "source_name": src.source_name,
                    "observed_dps": format_decimal(src.observed_dps),
                    "observed_dates": src.observed_dates,
                    "observed_at": src.observed_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
                })

        summary = f"Collected {len(observations)} disclosure observations for {company.ticker} via {actual_collector}."
        if recovery_occurred:
            summary += " (Task successfully recovered via standby worker)."

        self.log_run_and_message(
            task_id=task_id,
            correlation_id=correlation_id,
            agent_name="Data Collection Agent",
            sender=actual_collector,
            recipient="date-tracking-agent-1",
            message_type="OBSERVATION_COLLECTED",
            summary=summary,
            payload={"ticker": company.ticker, "observations_count": len(observations), "observations": observations},
        )

        return {"collector_used": actual_collector, "recovery_occurred": recovery_occurred, "observations": observations}

    # ---------------------------------------------------------
    # 2. Date Tracking Agent
    # ---------------------------------------------------------
    def run_date_tracking(
        self,
        company: Company,
        observations: List[Dict[str, Any]],
        correlation_id: str,
        task_id: str
    ) -> List[Dict[str, Any]]:
        tracker = self.get_or_create_agent_state(
            "date-tracker-1", "Date Tracking Agent", "Normalize and validate date fields"
        )
        tracker.last_heartbeat = datetime.now(timezone.utc)
        tracker.current_task = f"Normalizing dates for {company.ticker}"
        self.db.commit()

        normalized = []
        stale_count = 0
        for obs in observations:
            obs_dates = obs.get("observed_dates", {})
            ex_date_str = obs_dates.get("ex_date")
            pmt_date_str = obs_dates.get("payment_date")

            # Check stale date observation (e.g. observed > 7 days ago)
            obs_time = datetime.strptime(obs["observed_at"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
            is_stale = (datetime.now(timezone.utc) - obs_time) > timedelta(days=7)
            if is_stale:
                stale_count += 1

            normalized.append({
                **obs,
                "normalized_ex_date": ex_date_str,
                "normalized_payment_date": pmt_date_str,
                "is_stale": is_stale,
            })

        self.log_run_and_message(
            task_id=task_id,
            correlation_id=correlation_id,
            agent_name="Date Tracking Agent",
            sender="date-tracker-1",
            recipient="validator-agent-1",
            message_type="DATES_NORMALIZED",
            summary=f"Normalized date fields for {len(normalized)} observations. {stale_count} stale records flagged.",
            payload={"ticker": company.ticker, "normalized_count": len(normalized), "stale_count": stale_count},
        )

        return normalized

    # ---------------------------------------------------------
    # 3. Data Validation Agent
    # ---------------------------------------------------------
    def run_validation(
        self,
        company: Company,
        normalized_obs: List[Dict[str, Any]],
        correlation_id: str,
        task_id: str
    ) -> Dict[str, Any]:
        validator = self.get_or_create_agent_state(
            "validator-agent-1", "Data Validation Agent", "Detect duplicates, stale data, and conflicts"
        )
        validator.last_heartbeat = datetime.now(timezone.utc)
        validator.current_task = f"Validating observations for {company.ticker}"
        self.db.commit()

        # Group observations by event_id
        events_map: Dict[str, List[Dict[str, Any]]] = {}
        for obs in normalized_obs:
            evt_id = obs["event_id"]
            events_map.setdefault(evt_id, []).append(obs)

        agreements_count = 0
        conflicts_count = 0
        duplicates_count = 0
        stale_count = 0

        for evt_id, obs_list in events_map.items():
            event = self.db.query(DividendEvent).filter(DividendEvent.id == evt_id).first()
            if not event:
                continue

            # Duplicate check: filter unique source_id / observed_dps pairs
            unique_sources = set()
            dps_values = set()
            for obs in obs_list:
                src_key = (obs["source_name"], obs["observed_dps"])
                if src_key in unique_sources:
                    duplicates_count += 1
                else:
                    unique_sources.add(src_key)
                dps_values.add(obs["observed_dps"])

            # Check stale observations
            has_stale = any(obs.get("is_stale", False) for obs in obs_list)
            if has_stale:
                stale_count += 1

            # Detect Agreement vs. Conflict
            if len(dps_values) == 1:
                # Agreement!
                agreements_count += 1
                event.validation_status = "valid"
                event.dividend_per_share = float(list(dps_values)[0])
                self.db.commit()

                self.log_run_and_message(
                    task_id=f"{task_id}-match-{evt_id[:8]}",
                    correlation_id=correlation_id,
                    agent_name="Data Validation Agent",
                    sender="validator-agent-1",
                    recipient="calculator-agent-1",
                    message_type="EVENT_VALIDATED",
                    summary=f"AGREEMENT: All {len(obs_list)} sources match ₹{list(dps_values)[0]} DPS for {company.ticker}.",
                    payload={"event_id": event.id, "ticker": company.ticker, "dps": list(dps_values)[0], "status": "valid"},
                )
            elif len(dps_values) > 1:
                # Conflict!
                conflicts_count += 1
                event.validation_status = "conflict"
                self.db.commit()

                # Ensure DataAlert exists
                existing_alert = self.db.query(DataAlert).filter(
                    DataAlert.event_id == event.id, DataAlert.is_resolved == False
                ).first()
                if not existing_alert:
                    alert_desc = f"Source mismatch for {company.ticker}: " + " vs ".join(
                        f"{obs['source_name']} (₹{obs['observed_dps']})" for obs in obs_list
                    )
                    alert = DataAlert(
                        event_id=event.id,
                        alert_type="conflict",
                        description=alert_desc,
                        is_resolved=False,
                    )
                    self.db.add(alert)
                    self.db.commit()

                self.log_run_and_message(
                    task_id=f"{task_id}-conflict-{evt_id[:8]}",
                    correlation_id=correlation_id,
                    agent_name="Data Validation Agent",
                    sender="validator-agent-1",
                    recipient="calculator-agent-1",
                    message_type="EVENT_CONFLICT_DETECTED",
                    summary=f"CONFLICT ALERT: Sources disagree on DPS for {company.ticker} ({' vs '.join(list(dps_values))}).",
                    payload={"event_id": event.id, "ticker": company.ticker, "dps_values": list(dps_values), "status": "conflict"},
                )

        return {
            "agreements_count": agreements_count,
            "conflicts_count": conflicts_count,
            "duplicates_count": duplicates_count,
            "stale_count": stale_count,
        }

    # ---------------------------------------------------------
    # 4. Dividend Calculation Agent
    # ---------------------------------------------------------
    def run_calculation(
        self,
        company: Company,
        correlation_id: str,
        task_id: str
    ) -> List[Dict[str, Any]]:
        calculator = self.get_or_create_agent_state(
            "calculator-agent-1", "Dividend Calculation Agent", "Compute gross income estimates using deterministic rules"
        )
        calculator.last_heartbeat = datetime.now(timezone.utc)
        calculator.current_task = f"Calculating estimates for {company.ticker}"
        self.db.commit()

        holdings = self.db.query(Holding).filter(Holding.company_id == company.id).all()
        events = self.db.query(DividendEvent).filter(DividendEvent.company_id == company.id).all()

        results = []
        for holding in holdings:
            for event in events:
                calc_result = DividendCalculator.calculate_event_estimate(holding, event)
                results.append({
                    "holding_id": holding.id,
                    "event_id": event.id,
                    "ticker": company.ticker,
                    "eligible_shares": calc_result["eligible_shares"],
                    "dividend_per_share": calc_result["dividend_per_share"],
                    "estimated_gross_amount": calc_result["estimated_gross_amount"],
                    "calculation_status": calc_result["calculation_status"],
                    "formula": calc_result["formula"],
                })

                self.log_run_and_message(
                    task_id=f"{task_id}-calc-{holding.id[:8]}",
                    correlation_id=correlation_id,
                    agent_name="Dividend Calculation Agent",
                    sender="calculator-agent-1",
                    recipient="explanation-agent-1",
                    message_type="CALCULATION_COMPLETED",
                    summary=f"Calculated estimate for {company.ticker}: {calc_result['formula']} -> ₹{calc_result['estimated_gross_amount']} ({calc_result['calculation_status']}).",
                    payload=calc_result,
                )

        return results

    # ---------------------------------------------------------
    # 5. Monitoring & Recovery Agent
    # ---------------------------------------------------------
    def run_monitoring_audit(self, correlation_id: str) -> Dict[str, Any]:
        monitor = self.get_or_create_agent_state(
            "monitoring-recovery-agent-1", "Monitoring & Recovery Agent", "Monitor worker heartbeats & manage task recovery"
        )
        monitor.last_heartbeat = datetime.now(timezone.utc)
        monitor.current_task = "Auditing agent cluster health"
        self.db.commit()

        agents = self.db.query(AgentState).all()
        online_count = sum(1 for a in agents if a.status == "online")
        offline_count = sum(1 for a in agents if a.status == "offline")

        summary_msg = f"Cluster status audit complete. {online_count} agents online, {offline_count} offline."

        self.log_run_and_message(
            task_id=f"task-monitor-{int(datetime.now(timezone.utc).timestamp())}",
            correlation_id=correlation_id,
            agent_name="Monitoring & Recovery Agent",
            sender="monitoring-recovery-agent-1",
            recipient="broadcast",
            message_type="SYSTEM_HEALTH_UPDATED",
            summary=summary_msg,
            payload={"online_count": online_count, "offline_count": offline_count, "cluster_health": "degraded" if offline_count > 0 else "healthy"},
        )

        return {"online_count": online_count, "offline_count": offline_count, "health": "degraded" if offline_count > 0 else "healthy"}

    # ---------------------------------------------------------
    # Master Swarm Cycle Runner
    # ---------------------------------------------------------
    def run_full_swarm_cycle(
        self,
        target_ticker: Optional[str] = None,
        force_failure_agent_id: Optional[str] = None
    ) -> Dict[str, Any]:
        correlation_id = f"corr-wf-{int(datetime.now(timezone.utc).timestamp())}"
        
        # If simulated failure requested
        if force_failure_agent_id:
            agent_to_fail = self.db.query(AgentState).filter(AgentState.agent_id == force_failure_agent_id).first()
            if agent_to_fail:
                agent_to_fail.status = "offline"
                agent_to_fail.current_task = "Simulated process failure (Demo Control)"
                self.db.commit()

        companies_query = self.db.query(Company)
        if target_ticker:
            companies_query = companies_query.filter(Company.ticker == target_ticker.upper())
        companies = companies_query.all()

        total_collected = 0
        total_agreements = 0
        total_conflicts = 0
        total_recoveries = 0

        for company in companies:
            base_task_id = f"task-{company.ticker.lower()}-{int(datetime.now(timezone.utc).timestamp())}"
            
            # Step 1: Collection
            col_res = self.run_collection(company, correlation_id, f"{base_task_id}-col")
            total_collected += len(col_res["observations"])
            if col_res["recovery_occurred"]:
                total_recoveries += 1

            # Step 2: Date Tracking
            norm_obs = self.run_date_tracking(company, col_res["observations"], correlation_id, f"{base_task_id}-dates")

            # Step 3: Validation
            val_res = self.run_validation(company, norm_obs, correlation_id, f"{base_task_id}-val")
            total_agreements += val_res["agreements_count"]
            total_conflicts += val_res["conflicts_count"]

            # Step 4: Calculation
            self.run_calculation(company, correlation_id, f"{base_task_id}-calc")

        # Step 5: Monitoring Audit
        health_res = self.run_monitoring_audit(correlation_id)

        return {
            "correlation_id": correlation_id,
            "companies_processed": len(companies),
            "observations_collected": total_collected,
            "agreements_count": total_agreements,
            "conflicts_count": total_conflicts,
            "recoveries_count": total_recoveries,
            "cluster_health": health_res["health"],
        }
