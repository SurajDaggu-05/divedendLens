import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class AgentMessagePayload(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_id: str
    correlation_id: str
    sender: str
    recipient: str
    message_type: str
    schema_version: str = "1.0"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
    payload: Dict[str, Any] = Field(default_factory=dict)


def create_agent_message(
    task_id: str,
    correlation_id: str,
    sender: str,
    recipient: str,
    message_type: str,
    payload: Dict[str, Any]
) -> Dict[str, Any]:
    msg = AgentMessagePayload(
        task_id=task_id,
        correlation_id=correlation_id,
        sender=sender,
        recipient=recipient,
        message_type=message_type,
        payload=payload,
    )
    return msg.model_dump()
