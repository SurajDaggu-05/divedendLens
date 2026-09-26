from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class PortfolioCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None


class PortfolioUpdateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class HoldingCreateRequest(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=20)
    quantity: int = Field(..., gt=0)
    average_price: Optional[float] = None
    purchase_date: Optional[date] = None


class HoldingUpdateRequest(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)
    average_price: Optional[float] = None


class PortfolioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    holdings_count: int = 0
    created_at: datetime


class CompanySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    ticker: str
    name: str
    exchange: str = "NSE"


class UpcomingEventSummary(BaseModel):
    event_id: str
    ex_date: Optional[date] = None
    dividend_per_share: str
    estimated_gross_amount: str
    status: str


class HoldingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    portfolio_id: str
    company: CompanySummary
    quantity: int
    average_price: Optional[str] = None
    purchase_date: Optional[date] = None
    upcoming_event: Optional[UpcomingEventSummary] = None


class PortfolioSummaryResponse(BaseModel):
    portfolio_id: str
    currency: str = "INR"
    expected_income_fy: str
    received_income_fy: str
    upcoming_30_days: str
    unverified_amount: str
    last_calculated_at: datetime
