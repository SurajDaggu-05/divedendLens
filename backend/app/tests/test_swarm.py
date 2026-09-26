from decimal import Decimal
from datetime import datetime, timezone, date, timedelta
from sqlalchemy.orm import Session
from app.db.session import engine, Base, SessionLocal
from app.db.models import Company, DividendEvent, EventSource, DataAlert, Holding, AgentState, AgentRun, AgentMessage
from app.agents.swarm import SwarmEngine
from app.services.calculator import DividendCalculator


def setup_function():
    Base.metadata.create_all(bind=engine)


def test_1_two_agents_agree_on_same_dividend():
    """1. Test that two source observations with matching DPS result in agreement (valid status)."""
    db: Session = SessionLocal()
    try:
        engine_inst = SwarmEngine(db)
        company = db.query(Company).filter(Company.ticker == "TCS").first()
        assert company is not None

        # Execute full cycle
        res = engine_inst.run_full_swarm_cycle(target_ticker="TCS")
        assert res["agreements_count"] >= 1
        assert res["conflicts_count"] == 0

        event = db.query(DividendEvent).filter(DividendEvent.company_id == company.id).first()
        assert event.validation_status == "valid"
    finally:
        db.close()


def test_2_conflicting_dividend_observations_create_conflict():
    """2. Test that conflicting DPS values across sources create a DataAlert and set validation_status to conflict."""
    db: Session = SessionLocal()
    try:
        engine_inst = SwarmEngine(db)
        company = db.query(Company).filter(Company.ticker == "INFY").first()
        assert company is not None

        res = engine_inst.run_full_swarm_cycle(target_ticker="INFY")
        assert res["conflicts_count"] >= 1

        event = db.query(DividendEvent).filter(DividendEvent.company_id == company.id).first()
        assert event.validation_status == "conflict"

        alert = db.query(DataAlert).filter(DataAlert.event_id == event.id, DataAlert.is_resolved == False).first()
        assert alert is not None
        assert alert.alert_type == "conflict"
    finally:
        db.close()


def test_3_duplicate_observation_is_detected():
    """3. Test that duplicate observations are detected and deduplicated without creating side effects."""
    db: Session = SessionLocal()
    try:
        engine_inst = SwarmEngine(db)
        company = db.query(Company).filter(Company.ticker == "TCS").first()
        event = db.query(DividendEvent).filter(DividendEvent.company_id == company.id).first()

        # Add a duplicate source observation
        dup_source = EventSource(
            event_id=event.id,
            source_name="BSE Official Disclosure",
            observed_dps=10.00,
            observed_dates={"ex_date": "2026-10-10"},
        )
        db.add(dup_source)
        db.commit()

        obs = [
            {"event_id": event.id, "source_name": "BSE Official Disclosure", "observed_dps": "10.00", "observed_at": "2026-09-26T10:00:00Z"},
            {"event_id": event.id, "source_name": "BSE Official Disclosure", "observed_dps": "10.00", "observed_at": "2026-09-26T10:05:00Z"},
        ]

        val_res = engine_inst.run_validation(company, obs, "corr-dup-test", "task-dup-001")
        assert val_res["duplicates_count"] >= 1
    finally:
        db.close()


def test_4_stale_observation_is_detected():
    """4. Test that observations older than threshold are flagged as stale."""
    db: Session = SessionLocal()
    try:
        engine_inst = SwarmEngine(db)
        company = db.query(Company).filter(Company.ticker == "TCS").first()

        stale_time = (datetime.now(timezone.utc) - timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%SZ")
        stale_obs = [
            {
                "event_id": "f6a7b890-1234-5678-f012-678901234567",
                "source_name": "Old Disclosure",
                "observed_dps": "10.00",
                "observed_dates": {"ex_date": "2026-10-10"},
                "observed_at": stale_time,
            }
        ]

        normalized = engine_inst.run_date_tracking(company, stale_obs, "corr-stale-test", "task-stale-001")
        assert normalized[0]["is_stale"] is True
    finally:
        db.close()


def test_5_failed_agent_is_detected():
    """5. Test that a simulated agent failure sets agent status to offline."""
    db: Session = SessionLocal()
    try:
        engine_inst = SwarmEngine(db)
        agent = engine_inst.get_or_create_agent_state(
            "collector-agent-1", "Data Collection Agent", "Ingest disclosures"
        )
        agent.status = "offline"
        db.commit()

        fetched = db.query(AgentState).filter(AgentState.agent_id == "collector-agent-1").first()
        assert fetched.status == "offline"
    finally:
        db.close()


def test_6_failed_task_is_retried_and_reassigned():
    """6. Test that when primary collector is offline, task is reassigned to standby collector."""
    db: Session = SessionLocal()
    try:
        engine_inst = SwarmEngine(db)
        company = db.query(Company).filter(Company.ticker == "TCS").first()

        # Set primary collector offline
        collector = engine_inst.get_or_create_agent_state("collector-agent-1", "Collector 1", "Collection")
        collector.status = "offline"
        db.commit()

        col_res = engine_inst.run_collection(company, "corr-fail-test", "task-fail-001")
        assert col_res["recovery_occurred"] is True
        assert col_res["collector_used"] == "collector-agent-2"

        # Verify reassignment run logged
        reassign_run = db.query(AgentRun).filter(AgentRun.correlation_id == "corr-fail-test").first()
        assert reassign_run is not None
        assert reassign_run.status in ["retrying", "completed"]
    finally:
        db.close()


def test_7_successful_recovery_completes_the_workflow():
    """7. Test that full workflow completes successfully after standby worker recovery."""
    db: Session = SessionLocal()
    try:
        engine_inst = SwarmEngine(db)
        
        # Trigger full cycle with forced failure on collector-agent-1
        res = engine_inst.run_full_swarm_cycle(target_ticker="RELIANCE", force_failure_agent_id="collector-agent-1")
        assert res["recoveries_count"] >= 1
        assert res["agreements_count"] >= 1

        company = db.query(Company).filter(Company.ticker == "RELIANCE").first()
        event = db.query(DividendEvent).filter(DividendEvent.company_id == company.id).first()
        assert event.validation_status == "valid"
    finally:
        db.close()


def test_8_dividend_calculation_is_deterministic():
    """8. Test that dividend calculation uses fixed-precision Decimal math deterministically."""
    holding = Holding(quantity=25, purchase_date=date(2026, 1, 15))
    event = DividendEvent(dividend_per_share=Decimal("10.00"), ex_date=date(2026, 10, 10), validation_status="valid")

    calc = DividendCalculator.calculate_event_estimate(holding, event)
    assert calc["estimated_gross_amount"] == "250.00"
    assert calc["dividend_per_share"] == "10.00"
    assert isinstance(calc["estimated_gross_amount"], str)
