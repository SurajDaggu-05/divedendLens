from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import AgentState, AgentRun, DataAlert, DividendEvent, EventSource, Company
from app.core.security import get_current_user
from app.schemas.agent_alert import ResolveAlertRequest
from app.services.calculator import format_decimal
from app.db.seed import seed_database
from app.agents.swarm import SwarmEngine

router = APIRouter(tags=["Agents & Quality"])


@router.get("/agents")
def list_agents(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agents = db.query(AgentState).all()
    res = []
    for a in agents:
        res.append({
            "agent_id": a.agent_id,
            "name": a.name,
            "role": a.role,
            "status": a.status,
            "last_heartbeat": a.last_heartbeat,
            "current_task": a.current_task or "Idle",
            "is_simulated": a.is_simulated,
        })
    return {"success": True, "data": res}


@router.get("/agents/runs")
def list_agent_runs(
    limit: int = Query(20, ge=1, le=100),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    runs = db.query(AgentRun).order_by(AgentRun.started_at.desc()).limit(limit).all()
    res = []
    for r in runs:
        res.append({
            "run_id": r.id,
            "task_id": r.task_id,
            "correlation_id": r.correlation_id,
            "agent_name": r.agent_name,
            "status": r.status,
            "summary": r.summary,
            "started_at": r.started_at,
            "completed_at": r.completed_at,
        })
    return {"success": True, "data": res}


@router.post("/agents/trigger", status_code=status.HTTP_202_ACCEPTED)
def trigger_agent_refresh(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    engine = SwarmEngine(db)
    result = engine.run_full_swarm_cycle()

    return {
        "success": True,
        "data": {
            "correlation_id": result["correlation_id"],
            "companies_processed": result["companies_processed"],
            "agreements_count": result["agreements_count"],
            "conflicts_count": result["conflicts_count"],
            "recoveries_count": result["recoveries_count"],
            "message": "Swarm data refresh cycle completed successfully."
        }
    }


@router.post("/agents/{agent_id}/simulate-failure")
def simulate_agent_failure(
    agent_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(AgentState).filter(AgentState.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found.")
    
    agent.status = "offline"
    agent.current_task = "Process failure simulated (Demo Control)"
    db.commit()

    return {
        "success": True,
        "data": {
            "agent_id": agent.agent_id,
            "status": agent.status,
            "message": "Agent marked offline for demo simulation."
        }
    }


@router.post("/agents/{agent_id}/restart")
def restart_agent(
    agent_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(AgentState).filter(AgentState.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found.")
    
    agent.status = "online"
    agent.last_heartbeat = datetime.now(timezone.utc)
    agent.current_task = "Idle"
    db.commit()

    return {
        "success": True,
        "data": {
            "agent_id": agent.agent_id,
            "status": agent.status,
            "message": "Agent restarted successfully."
        }
    }


@router.get("/alerts")
def list_alerts(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = db.query(DataAlert).all()
    res = []
    for a in alerts:
        event = db.query(DividendEvent).filter(DividendEvent.id == a.event_id).first()
        company = db.query(Company).filter(Company.id == event.company_id).first() if event else None
        sources = db.query(EventSource).filter(EventSource.event_id == a.event_id).all() if event else []
        
        obs_data = [
            {
                "id": s.id,
                "source_name": s.source_name,
                "observed_dps": format_decimal(s.observed_dps),
                "observed_at": s.observed_at,
            }
            for s in sources
        ]

        res.append({
            "id": a.id,
            "event_id": a.event_id,
            "company_ticker": company.ticker if company else "",
            "alert_type": a.alert_type,
            "description": a.description,
            "is_resolved": a.is_resolved,
            "observations": obs_data,
            "created_at": a.created_at,
        })
    return {"success": True, "data": res}


@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: str,
    req: ResolveAlertRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(DataAlert).filter(DataAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    selected_source = db.query(EventSource).filter(EventSource.id == req.selected_source_id).first()
    if not selected_source:
        raise HTTPException(status_code=404, detail="Selected source not found.")

    # Update event with authoritative source value
    event = db.query(DividendEvent).filter(DividendEvent.id == alert.event_id).first()
    if event:
        event.dividend_per_share = selected_source.observed_dps
        event.validation_status = "valid"

    alert.is_resolved = True
    alert.resolved_by = current_user.id
    alert.resolution_notes = req.resolution_notes
    alert.resolved_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "success": True,
        "data": {
            "alert_id": alert.id,
            "is_resolved": True,
            "resolution_notes": alert.resolution_notes,
            "resolved_at": alert.resolved_at,
        }
    }


@router.post("/demo/reset")
def reset_demo(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seed_database(db)
    return {
        "success": True,
        "data": {
            "message": "Demo data state successfully reset."
        }
    }
