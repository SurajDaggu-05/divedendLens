from datetime import date, datetime, timezone
from sqlalchemy.orm import Session
from app.db.session import engine, Base, SessionLocal
from app.db.models import (
    User, Company, Portfolio, Holding, DividendEvent, EventSource,
    PaymentReport, DataAlert, AgentState, CalculationExplanation, AgentRun, AgentMessage
)
from argon2 import PasswordHasher

ph = PasswordHasher()


def seed_database(db: Session = None):
    close_db_on_exit = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db_on_exit = True

    try:
        # Clear existing data
        db.query(AgentMessage).delete()
        db.query(AgentRun).delete()
        db.query(AgentState).delete()
        db.query(CalculationExplanation).delete()
        db.query(DataAlert).delete()
        db.query(PaymentReport).delete()
        db.query(EventSource).delete()
        db.query(Holding).delete()
        db.query(DividendEvent).delete()
        db.query(Portfolio).delete()
        db.query(Company).delete()
        db.query(User).delete()
        db.commit()

        # 1. Create Demo User
        demo_user = User(
            id="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            name="Arjun Sharma",
            email="arjun@example.com",
            password_hash=ph.hash("SecurePassword123!"),
        )
        db.add(demo_user)
        db.commit()

        # 2. Create Companies
        tcs = Company(
            id="comp-tcs-001",
            ticker="TCS",
            name="Tata Consultancy Services Ltd",
            exchange="NSE",
            isin="INE467B01029",
        )
        infy = Company(
            id="comp-infy-002",
            ticker="INFY",
            name="Infosys Limited",
            exchange="NSE",
            isin="INE009A01021",
        )
        reliance = Company(
            id="comp-rel-003",
            ticker="RELIANCE",
            name="Reliance Industries Ltd",
            exchange="NSE",
            isin="INE002A01018",
        )
        db.add_all([tcs, infy, reliance])
        db.commit()

        # 3. Create Demo Dividend Events & Sources
        event_tcs = DividendEvent(
            id="f6a7b890-1234-5678-f012-678901234567",
            company_id=tcs.id,
            event_type="interim",
            dividend_per_share=10.00,
            currency="INR",
            announcement_date=date(2026, 9, 15),
            ex_date=date(2026, 10, 10),
            record_date=date(2026, 10, 11),
            payment_date=date(2026, 10, 25),
            business_status="announced",
            validation_status="valid",
            is_demo_data=True,
        )
        source_tcs = EventSource(
            id="src-tcs-001",
            event_id=event_tcs.id,
            source_name="BSE Official Disclosure",
            source_url="https://www.bseindia.com/demo",
            observed_dps=10.00,
            observed_dates={"ex_date": "2026-10-10", "payment_date": "2026-10-25"},
        )

        event_infy = DividendEvent(
            id="evt-infy-002",
            company_id=infy.id,
            event_type="interim",
            dividend_per_share=18.00,
            currency="INR",
            announcement_date=date(2026, 9, 20),
            ex_date=date(2026, 10, 15),
            record_date=date(2026, 10, 16),
            payment_date=date(2026, 10, 30),
            business_status="announced",
            validation_status="conflict",  # Intentionally conflicting
            is_demo_data=True,
        )
        source_infy1 = EventSource(
            id="src-infy-001",
            event_id=event_infy.id,
            source_name="BSE Official Disclosure",
            source_url="https://www.bseindia.com/demo",
            observed_dps=18.00,
            observed_dates={"ex_date": "2026-10-15", "payment_date": "2026-10-30"},
        )
        source_infy2 = EventSource(
            id="src-infy-002",
            event_id=event_infy.id,
            source_name="NSE Market Feed",
            source_url="https://www.nseindia.com/demo",
            observed_dps=20.00,
            observed_dates={"ex_date": "2026-10-15", "payment_date": "2026-10-30"},
        )
        alert_infy = DataAlert(
            id="alert-infy-001",
            event_id=event_infy.id,
            alert_type="conflict",
            description="BSE reports ₹18.00 DPS while NSE reports ₹20.00 DPS.",
            is_resolved=False,
        )

        event_rel = DividendEvent(
            id="evt-rel-003",
            company_id=reliance.id,
            event_type="final",
            dividend_per_share=15.00,
            currency="INR",
            announcement_date=date(2026, 9, 22),
            ex_date=date(2026, 11, 1),
            record_date=date(2026, 11, 2),
            payment_date=date(2026, 11, 15),
            business_status="announced",
            validation_status="valid",
            is_demo_data=True,
        )
        source_rel = EventSource(
            id="src-rel-001",
            event_id=event_rel.id,
            source_name="NSE Official Disclosure",
            source_url="https://www.nseindia.com/demo",
            observed_dps=15.00,
            observed_dates={"ex_date": "2026-11-01", "payment_date": "2026-11-15"},
        )

        db.add_all([
            event_tcs, source_tcs,
            event_infy, source_infy1, source_infy2, alert_infy,
            event_rel, source_rel
        ])
        db.commit()

        # 4. Create Portfolio & Holdings
        portfolio = Portfolio(
            id="b2c3d4e5-f6a7-8901-bcde-f23456789012",
            user_id=demo_user.id,
            name="My Core Equities",
            description="Long-term dividend growth stocks",
        )
        db.add(portfolio)
        db.commit()

        holding_tcs = Holding(
            id="d4e5f6a7-b890-1234-def0-456789012345",
            portfolio_id=portfolio.id,
            company_id=tcs.id,
            quantity=25,
            average_price=3850.00,
            purchase_date=date(2026, 1, 15),
        )
        holding_infy = Holding(
            id="e5f6a7b8-9012-3456-ef01-567890123457",
            portfolio_id=portfolio.id,
            company_id=infy.id,
            quantity=50,
            average_price=1520.50,
            purchase_date=date(2026, 3, 10),
        )
        holding_rel = Holding(
            id="hld-rel-003",
            portfolio_id=portfolio.id,
            company_id=reliance.id,
            quantity=30,
            average_price=2450.00,
            purchase_date=date(2026, 2, 20),
        )
        db.add_all([holding_tcs, holding_infy, holding_rel])
        db.commit()

        # 5. Create Payment Report (User Reported Received Payment)
        payment_report = PaymentReport(
            id="77777777-8888-9999-0000-111122223333",
            user_id=demo_user.id,
            event_id=event_tcs.id,
            amount_received=800.00,
            received_date=date(2026, 8, 15),
            notes="Previous quarter dividend credited directly to bank account.",
            status="received_user_reported",
        )
        db.add(payment_report)
        db.commit()

        # 6. Create Agent States & Runs
        agent_collector = AgentState(
            agent_id="collector-agent-1",
            name="Data Collection Agent",
            role="Ingest raw observations from disclosures",
            status="online",
            current_task="Idle",
            is_simulated=True,
        )
        agent_tracker = AgentState(
            agent_id="date-tracker-1",
            name="Date Tracking Agent",
            role="Normalize and validate date fields",
            status="online",
            current_task="Idle",
            is_simulated=True,
        )
        agent_validator = AgentState(
            agent_id="validator-agent-1",
            name="Data Validation Agent",
            role="Detect duplicates, stale data, and source conflicts",
            status="online",
            current_task="Idle",
            is_simulated=True,
        )
        agent_calculator = AgentState(
            agent_id="calculator-agent-1",
            name="Dividend Calculation Agent",
            role="Compute gross income estimates using deterministic rules",
            status="online",
            current_task="Idle",
            is_simulated=True,
        )
        db.add_all([agent_collector, agent_tracker, agent_validator, agent_calculator])
        db.commit()

        # 7. Create Explanation Cache
        explanation_tcs = CalculationExplanation(
            id="exp-tcs-001",
            event_id=event_tcs.id,
            explanation_text="Based on your 25 shares of TCS, your estimated interim dividend is ₹250.00. Calculated as 25 shares × ₹10.00 per share announced on 15 Sep 2026. The ex-dividend date is 10 Oct 2026. Verified from BSE Official Disclosure.",
            provider_used="template",
        )
        db.add(explanation_tcs)
        db.commit()

        print("Database successfully seeded with deterministic demo data!")
    finally:
        if close_db_on_exit:
            db.close()


if __name__ == "__main__":
    seed_database()
