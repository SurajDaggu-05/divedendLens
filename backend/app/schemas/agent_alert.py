from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class AgentStateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    agent_id: str
    name: str
    role: str
    status: str
    last_heartbeat: datetime
    current_task: Optional[str] = None
    is_simulated: bool = True


class AgentRunResponse(BaseModel):
    run_id: str
    task_id: str
    correlation_id: str
    agent_name: str
    status: str
    summary: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None


class DataAlertResponse(BaseModel):
    id: str
    event_id: str
    company_ticker: str
    alert_type: str
    description: str
    is_resolved: bool
    observations: List[Dict[str, Any]] = []
    created_at: datetime


class ResolveAlertRequest(BaseModel):
    selected_source_id: str
    resolution_notes: Optional[str] = None
