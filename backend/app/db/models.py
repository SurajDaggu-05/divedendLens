import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Text,
    JSON,
    CheckConstraint,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def current_utc_time():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=current_utc_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=current_utc_time, onupdate=current_utc_time, nullable=False)

    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    payment_reports = relationship("PaymentReport", back_populates="user", cascade="all, delete-orphan")
    resolved_alerts = relationship("DataAlert", back_populates="resolver")


class Company(Base):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ticker = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    exchange = Column(String(10), default="NSE", nullable=False)
    isin = Column(String(12), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), default=current_utc_time, nullable=False)

    holdings = relationship("Holding", back_populates="company")
    dividend_events = relationship("DividendEvent", back_populates="company")


class Portfolio(Base):
    __tablename__ = "portfolios"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_user_portfolio_name"),)

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=current_utc_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=current_utc_time, onupdate=current_utc_time, nullable=False)

    user = relationship("User", back_populates="portfolios")
    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")


class Holding(Base):
    __tablename__ = "holdings"
    __table_args__ = (
        UniqueConstraint("portfolio_id", "company_id", name="uq_portfolio_company"),
        CheckConstraint("quantity > 0", name="chk_holding_quantity_positive"),
    )

    id = Column(String(36), primary_key=True, default=generate_uuid)
    portfolio_id = Column(String(36), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    average_price = Column(Numeric(12, 2), nullable=True)
    purchase_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=current_utc_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=current_utc_time, onupdate=current_utc_time, nullable=False)

    portfolio = relationship("Portfolio", back_populates="holdings")
    company = relationship("Company", back_populates="holdings")


class DividendEvent(Base):
    __tablename__ = "dividend_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False, index=True)
    event_type = Column(String(20), default="interim", nullable=False)
    dividend_per_share = Column(Numeric(10, 4), nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    announcement_date = Column(Date, nullable=True)
    ex_date = Column(Date, nullable=True, index=True)
    record_date = Column(Date, nullable=True)
    payment_date = Column(Date, nullable=True)
    business_status = Column(String(20), default="announced", nullable=False)
    validation_status = Column(String(20), default="unverified", nullable=False, index=True)
    is_demo_data = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=current_utc_time, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=current_utc_time, onupdate=current_utc_time, nullable=False)

    company = relationship("Company", back_populates="dividend_events")
    sources = relationship("EventSource", back_populates="event", cascade="all, delete-orphan")
    payment_reports = relationship("PaymentReport", back_populates="event")
    alerts = relationship("DataAlert", back_populates="event", cascade="all, delete-orphan")
    explanations = relationship("CalculationExplanation", back_populates="event", cascade="all, delete-orphan")


class EventSource(Base):
    __tablename__ = "event_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("dividend_events.id", ondelete="CASCADE"), nullable=False, index=True)
    source_name = Column(String(100), nullable=False)
    source_url = Column(Text, nullable=True)
    observed_dps = Column(Numeric(10, 4), nullable=False)
    observed_dates = Column(JSON, nullable=False)
    observed_at = Column(DateTime(timezone=True), default=current_utc_time, nullable=False)

    event = relationship("DividendEvent", back_populates="sources")


class PaymentReport(Base):
    __tablename__ = "payment_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(String(36), ForeignKey("dividend_events.id"), nullable=False)
    amount_received = Column(Numeric(12, 2), nullable=False)
    received_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String(30), default="received_user_reported", nullable=False)
    created_at = Column(DateTime(timezone=True), default=current_utc_time, nullable=False)

    user = relationship("User", back_populates="payment_reports")
    event = relationship("DividendEvent", back_populates="payment_reports")


class DataAlert(Base):
    __tablename__ = "data_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("dividend_events.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(String(30), nullable=False)  # conflict, stale, missing_fields, duplicate
    description = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False, index=True)
    resolved_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=current_utc_time, nullable=False)

    event = relationship("DividendEvent", back_populates="alerts")
    resolver = relationship("User", back_populates="resolved_alerts")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(100), nullable=False, index=True)
    correlation_id = Column(String(100), nullable=False, index=True)
    agent_name = Column(String(100), nullable=False)
    status = Column(String(20), default="pending", nullable=False)  # pending, running, completed, failed, retrying
    started_at = Column(DateTime(timezone=True), default=current_utc_time, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    summary = Column(Text, nullable=True)

    messages = relationship("AgentMessage", back_populates="run", cascade="all, delete-orphan")


class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("agent_runs.id", ondelete="SET NULL"), nullable=True)
    correlation_id = Column(String(100), nullable=False, index=True)
    sender = Column(String(100), nullable=False)
    recipient = Column(String(100), nullable=False)
    message_type = Column(String(50), nullable=False)
    schema_version = Column(String(10), default="1.0", nullable=False)
    payload = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=current_utc_time, nullable=False, index=True)

    run = relationship("AgentRun", back_populates="messages")


class AgentState(Base):
    __tablename__ = "agent_states"

    agent_id = Column(String(100), primary_key=True)
    name = Column(String(100), nullable=False)
    role = Column(String(255), nullable=False)
    status = Column(String(20), default="online", nullable=False)  # online, degraded, offline
    last_heartbeat = Column(DateTime(timezone=True), default=current_utc_time, nullable=False, index=True)
    current_task = Column(String(255), nullable=True)
    is_simulated = Column(Boolean, default=True, nullable=False)


class CalculationExplanation(Base):
    __tablename__ = "calculation_explanations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_id = Column(String(36), ForeignKey("dividend_events.id", ondelete="CASCADE"), nullable=False, index=True)
    explanation_text = Column(Text, nullable=False)
    provider_used = Column(String(20), default="template", nullable=False)
    created_at = Column(DateTime(timezone=True), default=current_utc_time, nullable=False)

    event = relationship("DividendEvent", back_populates="explanations")
