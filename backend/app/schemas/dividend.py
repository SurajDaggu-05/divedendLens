from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class EventSourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_name: str
    source_url: Optional[str] = None
    observed_dps: str
    observed_at: datetime


class CalculationBreakdown(BaseModel):
    eligible_shares: int
    dividend_per_share: str
    estimated_gross_amount: str
    formula: str
    calculation_status: str
    calculated_at: datetime


class DividendEventResponse(BaseModel):
    id: str
    company: Dict[str, Any]
    event_type: str
    dividend_per_share: str
    currency: str = "INR"
    announcement_date: Optional[date] = None
    ex_date: Optional[date] = None
    record_date: Optional[date] = None
    payment_date: Optional[date] = None
    business_status: str
    validation_status: str
    is_demo_data: bool = True
    last_validated_at: Optional[datetime] = None


class DividendEventDetailResponse(DividendEventResponse):
    dates: Dict[str, Optional[date]]
    calculation: Optional[CalculationBreakdown] = None
    sources: List[EventSourceResponse] = []


class PaymentReportRequest(BaseModel):
    amount_received: float = Field(..., ge=0)
    received_date: date
    notes: Optional[str] = None


class PaymentReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    event_id: str
    amount_received: str
    received_date: date
    status: str = "received_user_reported"
    notes: Optional[str] = None
    created_at: datetime
