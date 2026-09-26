from datetime import date, datetime, timezone, timedelta

from sqlalchemy.orm import Session
from argon2 import PasswordHasher

from app.db.session import engine, Base, SessionLocal
from app.db.models import (
    User,
    Company,
    Portfolio,
    Holding,
    DividendEvent,
    EventSource,
    PaymentReport,
    DataAlert,
    AgentState,
    CalculationExplanation,
    AgentRun,
    AgentMessage,
)


ph = PasswordHasher()


def utc_now():
    return datetime.now(timezone.utc)


def seed_database(db: Session = None):
    close_db_on_exit = False

    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_db_on_exit = True

    try:
        # ============================================================
        # 1. CLEAR EXISTING DEMO DATA
        # ============================================================

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

        # ============================================================
        # 2. DEMO USERS
        # ============================================================

        demo_user = User(
            id="a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            name="Arjun Sharma",
            email="arjun@example.com",
            password_hash=ph.hash("SecurePassword123!"),
        )

        suraj_user = User(
            id="usr-suraj-001",
            name="Suraj",
            email="surajdaggu40@gmail.com",
            password_hash=ph.hash("suraj40"),
        )

        parvath_user = User(
            id="usr-parvath-002",
            name="Parvath",
            email="parvath06@gmail.com",
            password_hash=ph.hash("parvath06"),
        )

        sushanth_user = User(
            id="usr-sushanth-003",
            name="Sushanth",
            email="sushanth05@gmail.com",
            password_hash=ph.hash("sushanth05"),
        )

        kiran_user = User(
            id="usr-kiran-004",
            name="Kiran",
            email="kiran23@gmail.com",
            password_hash=ph.hash("kiran23"),
        )

        db.add_all([demo_user, suraj_user, parvath_user, sushanth_user, kiran_user])
        db.commit()

        # ============================================================
        # 3. COMPANIES
        # ============================================================

        companies = [
            Company(
                id="comp-tcs-001",
                ticker="TCS",
                name="Tata Consultancy Services Ltd",
                exchange="NSE",
                isin="INE467B01029",
            ),
            Company(
                id="comp-infy-002",
                ticker="INFY",
                name="Infosys Limited",
                exchange="NSE",
                isin="INE009A01021",
            ),
            Company(
                id="comp-rel-003",
                ticker="RELIANCE",
                name="Reliance Industries Ltd",
                exchange="NSE",
                isin="INE002A01018",
            ),
            Company(
                id="comp-itc-004",
                ticker="ITC",
                name="ITC Limited",
                exchange="NSE",
                isin="INE154A01025",
            ),
            Company(
                id="comp-hdfc-005",
                ticker="HDFCBANK",
                name="HDFC Bank Limited",
                exchange="NSE",
                isin="INE040A01034",
            ),
            Company(
                id="comp-sbin-006",
                ticker="SBIN",
                name="State Bank of India",
                exchange="NSE",
                isin="INE062A01020",
            ),
            Company(
                id="comp-hcl-007",
                ticker="HCLTECH",
                name="HCL Technologies Limited",
                exchange="NSE",
                isin="INE860A01027",
            ),
            Company(
                id="comp-wipro-008",
                ticker="WIPRO",
                name="Wipro Limited",
                exchange="NSE",
                isin="INE075A01022",
            ),
        ]

        db.add_all(companies)
        db.commit()

        company_map = {company.ticker: company for company in companies}

        # ============================================================
        # 4. DIVIDEND EVENTS
        # ============================================================

        # ------------------------------------------------------------
        # TCS - HISTORICAL / PAID
        # ------------------------------------------------------------

        tcs_paid = DividendEvent(
            id="evt-tcs-paid-001",
            company_id=company_map["TCS"].id,
            event_type="interim",
            dividend_per_share=9.00,
            currency="INR",
            announcement_date=date(2026, 6, 15),
            ex_date=date(2026, 7, 1),
            record_date=date(2026, 7, 2),
            payment_date=date(2026, 7, 15),
            business_status="paid",
            validation_status="valid",
            is_demo_data=True,
        )

        # ------------------------------------------------------------
        # TCS - UPCOMING / VERIFIED
        # ------------------------------------------------------------

        tcs_upcoming = DividendEvent(
            id="evt-tcs-upcoming-002",
            company_id=company_map["TCS"].id,
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

        # ------------------------------------------------------------
        # INFY - CONFLICT
        # ------------------------------------------------------------

        infy_event = DividendEvent(
            id="evt-infy-003",
            company_id=company_map["INFY"].id,
            event_type="interim",
            dividend_per_share=18.00,
            currency="INR",
            announcement_date=date(2026, 9, 20),
            ex_date=date(2026, 10, 15),
            record_date=date(2026, 10, 16),
            payment_date=date(2026, 10, 30),
            business_status="announced",
            validation_status="conflict",
            is_demo_data=True,
        )

        # ------------------------------------------------------------
        # RELIANCE - PAID
        # ------------------------------------------------------------

        reliance_event = DividendEvent(
            id="evt-rel-004",
            company_id=company_map["RELIANCE"].id,
            event_type="final",
            dividend_per_share=15.00,
            currency="INR",
            announcement_date=date(2026, 7, 20),
            ex_date=date(2026, 8, 1),
            record_date=date(2026, 8, 2),
            payment_date=date(2026, 8, 15),
            business_status="paid",
            validation_status="valid",
            is_demo_data=True,
        )

        # ------------------------------------------------------------
        # ITC - UPCOMING
        # ------------------------------------------------------------

        itc_event = DividendEvent(
            id="evt-itc-005",
            company_id=company_map["ITC"].id,
            event_type="interim",
            dividend_per_share=7.50,
            currency="INR",
            announcement_date=date(2026, 9, 18),
            ex_date=date(2026, 10, 20),
            record_date=date(2026, 10, 21),
            payment_date=date(2026, 11, 5),
            business_status="announced",
            validation_status="valid",
            is_demo_data=True,
        )

        # ------------------------------------------------------------
        # HDFC BANK - UPCOMING
        # ------------------------------------------------------------

        hdfc_event = DividendEvent(
            id="evt-hdfc-006",
            company_id=company_map["HDFCBANK"].id,
            event_type="final",
            dividend_per_share=22.00,
            currency="INR",
            announcement_date=date(2026, 9, 10),
            ex_date=date(2026, 10, 25),
            record_date=date(2026, 10, 26),
            payment_date=date(2026, 11, 10),
            business_status="announced",
            validation_status="valid",
            is_demo_data=True,
        )

        # ------------------------------------------------------------
        # SBI - PAYMENT PENDING
        # ------------------------------------------------------------

        sbi_event = DividendEvent(
            id="evt-sbi-007",
            company_id=company_map["SBIN"].id,
            event_type="final",
            dividend_per_share=13.70,
            currency="INR",
            announcement_date=date(2026, 8, 20),
            ex_date=date(2026, 9, 1),
            record_date=date(2026, 9, 2),
            payment_date=date(2026, 9, 20),
            business_status="paid",
            validation_status="valid",
            is_demo_data=True,
        )

        # ------------------------------------------------------------
        # HCLTECH - VERIFIED
        # ------------------------------------------------------------

        hcl_event = DividendEvent(
            id="evt-hcl-008",
            company_id=company_map["HCLTECH"].id,
            event_type="interim",
            dividend_per_share=12.00,
            currency="INR",
            announcement_date=date(2026, 9, 5),
            ex_date=date(2026, 10, 5),
            record_date=date(2026, 10, 6),
            payment_date=date(2026, 10, 20),
            business_status="announced",
            validation_status="valid",
            is_demo_data=True,
        )

        # ------------------------------------------------------------
        # WIPRO - REVIEW / CONFLICT
        # ------------------------------------------------------------

        wipro_event = DividendEvent(
            id="evt-wipro-009",
            company_id=company_map["WIPRO"].id,
            event_type="interim",
            dividend_per_share=6.00,
            currency="INR",
            announcement_date=date(2026, 9, 12),
            ex_date=date(2026, 10, 12),
            record_date=date(2026, 10, 13),
            payment_date=date(2026, 10, 28),
            business_status="announced",
            validation_status="conflict",
            is_demo_data=True,
        )

        events = [
            tcs_paid,
            tcs_upcoming,
            infy_event,
            reliance_event,
            itc_event,
            hdfc_event,
            sbi_event,
            hcl_event,
            wipro_event,
        ]

        db.add_all(events)
        db.commit()

        # ============================================================
        # 5. DISTRIBUTED SOURCE OBSERVATIONS
        # ============================================================

        sources = [
            # TCS historical
            EventSource(
                id="src-tcs-paid-bse",
                event_id=tcs_paid.id,
                source_name="BSE Official Disclosure",
                source_url="https://www.bseindia.com/",
                observed_dps=9.00,
                observed_dates={
                    "ex_date": "2026-07-01",
                    "payment_date": "2026-07-15",
                },
            ),

            # TCS upcoming - agreement
            EventSource(
                id="src-tcs-up-bse",
                event_id=tcs_upcoming.id,
                source_name="BSE Official Disclosure",
                source_url="https://www.bseindia.com/",
                observed_dps=10.00,
                observed_dates={
                    "ex_date": "2026-10-10",
                    "payment_date": "2026-10-25",
                },
            ),
            EventSource(
                id="src-tcs-up-nse",
                event_id=tcs_upcoming.id,
                source_name="NSE Market Feed",
                source_url="https://www.nseindia.com/",
                observed_dps=10.00,
                observed_dates={
                    "ex_date": "2026-10-10",
                    "payment_date": "2026-10-25",
                },
            ),

            # INFY - deliberate conflict
            EventSource(
                id="src-infy-bse",
                event_id=infy_event.id,
                source_name="BSE Official Disclosure",
                source_url="https://www.bseindia.com/",
                observed_dps=18.00,
                observed_dates={
                    "ex_date": "2026-10-15",
                    "payment_date": "2026-10-30",
                },
            ),
            EventSource(
                id="src-infy-nse",
                event_id=infy_event.id,
                source_name="NSE Market Feed",
                source_url="https://www.nseindia.com/",
                observed_dps=20.00,
                observed_dates={
                    "ex_date": "2026-10-15",
                    "payment_date": "2026-10-30",
                },
            ),

            # Reliance
            EventSource(
                id="src-rel-nse",
                event_id=reliance_event.id,
                source_name="NSE Official Disclosure",
                source_url="https://www.nseindia.com/",
                observed_dps=15.00,
                observed_dates={
                    "ex_date": "2026-08-01",
                    "payment_date": "2026-08-15",
                },
            ),
            EventSource(
                id="src-rel-bse",
                event_id=reliance_event.id,
                source_name="BSE Official Disclosure",
                source_url="https://www.bseindia.com/",
                observed_dps=15.00,
                observed_dates={
                    "ex_date": "2026-08-01",
                    "payment_date": "2026-08-15",
                },
            ),

            # ITC
            EventSource(
                id="src-itc-nse",
                event_id=itc_event.id,
                source_name="NSE Market Feed",
                source_url="https://www.nseindia.com/",
                observed_dps=7.50,
                observed_dates={
                    "ex_date": "2026-10-20",
                    "payment_date": "2026-11-05",
                },
            ),

            # HDFC Bank
            EventSource(
                id="src-hdfc-nse",
                event_id=hdfc_event.id,
                source_name="NSE Market Feed",
                source_url="https://www.nseindia.com/",
                observed_dps=22.00,
                observed_dates={
                    "ex_date": "2026-10-25",
                    "payment_date": "2026-11-10",
                },
            ),

            # SBI
            EventSource(
                id="src-sbi-bse",
                event_id=sbi_event.id,
                source_name="BSE Official Disclosure",
                source_url="https://www.bseindia.com/",
                observed_dps=13.70,
                observed_dates={
                    "ex_date": "2026-09-01",
                    "payment_date": "2026-09-20",
                },
            ),

            # HCL
            EventSource(
                id="src-hcl-nse",
                event_id=hcl_event.id,
                source_name="NSE Market Feed",
                source_url="https://www.nseindia.com/",
                observed_dps=12.00,
                observed_dates={
                    "ex_date": "2026-10-05",
                    "payment_date": "2026-10-20",
                },
            ),

            # Wipro conflict
            EventSource(
                id="src-wipro-bse",
                event_id=wipro_event.id,
                source_name="BSE Official Disclosure",
                source_url="https://www.bseindia.com/",
                observed_dps=6.00,
                observed_dates={
                    "ex_date": "2026-10-12",
                    "payment_date": "2026-10-28",
                },
            ),
            EventSource(
                id="src-wipro-nse",
                event_id=wipro_event.id,
                source_name="NSE Market Feed",
                source_url="https://www.nseindia.com/",
                observed_dps=6.50,
                observed_dates={
                    "ex_date": "2026-10-12",
                    "payment_date": "2026-10-28",
                },
            ),
        ]

        db.add_all(sources)
        db.commit()

        # ============================================================
        # 6. PORTFOLIOS
        # ============================================================

        portfolio = Portfolio(
            id="b2c3d4e5-f6a7-8901-bcde-f23456789012",
            user_id=demo_user.id,
            name="My Core Equities",
            description="Long-term dividend growth stocks",
        )

        suraj_portfolio = Portfolio(
            id="pfl-suraj-001",
            user_id=suraj_user.id,
            name="Suraj Core Equities",
            description="Dividend growth portfolio",
        )

        parvath_portfolio = Portfolio(
            id="pfl-parvath-002",
            user_id=parvath_user.id,
            name="Parvath Core Equities",
            description="Dividend growth portfolio",
        )

        sushanth_portfolio = Portfolio(
            id="pfl-sushanth-003",
            user_id=sushanth_user.id,
            name="Sushanth Core Equities",
            description="Dividend growth portfolio",
        )

        kiran_portfolio = Portfolio(
            id="pfl-kiran-004",
            user_id=kiran_user.id,
            name="Kiran Core Equities",
            description="Dividend growth portfolio",
        )

        db.add_all([portfolio, suraj_portfolio, parvath_portfolio, sushanth_portfolio, kiran_portfolio])
        db.commit()

        # ============================================================
        # 7. HOLDINGS
        # ============================================================

        holdings = [
            Holding(
                id="hld-tcs-001",
                portfolio_id=portfolio.id,
                company_id=company_map["TCS"].id,
                quantity=25,
                average_price=3850.00,
                purchase_date=date(2026, 1, 15),
            ),
            Holding(
                id="hld-infy-002",
                portfolio_id=portfolio.id,
                company_id=company_map["INFY"].id,
                quantity=50,
                average_price=1520.50,
                purchase_date=date(2026, 3, 10),
            ),
            Holding(
                id="hld-rel-003",
                portfolio_id=portfolio.id,
                company_id=company_map["RELIANCE"].id,
                quantity=30,
                average_price=2450.00,
                purchase_date=date(2026, 2, 20),
            ),
            Holding(
                id="hld-itc-004",
                portfolio_id=portfolio.id,
                company_id=company_map["ITC"].id,
                quantity=100,
                average_price=465.00,
                purchase_date=date(2026, 4, 12),
            ),
            Holding(
                id="hld-hdfc-005",
                portfolio_id=portfolio.id,
                company_id=company_map["HDFCBANK"].id,
                quantity=20,
                average_price=1680.00,
                purchase_date=date(2026, 5, 5),
            ),
            Holding(
                id="hld-sbi-006",
                portfolio_id=portfolio.id,
                company_id=company_map["SBIN"].id,
                quantity=40,
                average_price=820.00,
                purchase_date=date(2026, 5, 18),
            ),
            Holding(
                id="hld-hcl-007",
                portfolio_id=portfolio.id,
                company_id=company_map["HCLTECH"].id,
                quantity=30,
                average_price=1450.00,
                purchase_date=date(2026, 6, 1),
            ),
            Holding(
                id="hld-wipro-008",
                portfolio_id=portfolio.id,
                company_id=company_map["WIPRO"].id,
                quantity=60,
                average_price=520.00,
                purchase_date=date(2026, 6, 15),
            ),
        ]

        db.add_all(holdings)
        db.commit()

        # ============================================================
        # 8. PAYMENT REPORTS
        # ============================================================

        payment_reports = [
            PaymentReport(
                id="pay-tcs-001",
                user_id=demo_user.id,
                event_id=tcs_paid.id,
                amount_received=225.00,
                received_date=date(2026, 7, 16),
                notes="TCS historical dividend credited to bank account.",
                status="received_user_reported",
            ),
            PaymentReport(
                id="pay-rel-002",
                user_id=demo_user.id,
                event_id=reliance_event.id,
                amount_received=450.00,
                received_date=date(2026, 8, 16),
                notes="Reliance dividend received.",
                status="received_user_reported",
            ),
        ]

        db.add_all(payment_reports)
        db.commit()

        # ============================================================
        # 9. ALERTS
        # ============================================================

        alerts = [
            DataAlert(
                id="alert-infy-001",
                event_id=infy_event.id,
                alert_type="conflict",
                description=(
                    "Distributed observations disagree: "
                    "BSE reports ₹18.00 DPS while NSE reports ₹20.00 DPS."
                ),
                is_resolved=False,
            ),
            DataAlert(
                id="alert-wipro-002",
                event_id=wipro_event.id,
                alert_type="conflict",
                description=(
                    "Wipro dividend observations differ between "
                    "BSE and NSE sources."
                ),
                is_resolved=False,
            ),
            DataAlert(
                id="alert-sbi-003",
                event_id=sbi_event.id,
                alert_type="missing_fields",
                description=(
                    "Dividend payment date has passed but no user payment "
                    "confirmation has been recorded."
                ),
                is_resolved=False,
            ),
            DataAlert(
                id="alert-tcs-004",
                event_id=tcs_paid.id,
                alert_type="stale",
                description=(
                    "Historical event was detected with delayed source "
                    "observation during the monitoring cycle."
                ),
                is_resolved=True,
                resolved_by=demo_user.id,
                resolution_notes="Validated against the historical BSE observation.",
                resolved_at=utc_now() - timedelta(days=20),
            ),
        ]

        db.add_all(alerts)
        db.commit()

        # ============================================================
        # 10. SWARM AGENT STATES
        # ============================================================

        agent_states = [
            AgentState(
                agent_id="collector-agent-1",
                name="Data Collection Agent",
                role="Collect raw dividend observations from distributed sources",
                status="online",
                current_task="Collecting TCS and ITC observations",
                is_simulated=True,
            ),
            AgentState(
                agent_id="date-tracker-1",
                name="Date Tracking Agent",
                role="Normalize and validate dividend date fields",
                status="online",
                current_task="Tracking upcoming ex-dates",
                is_simulated=True,
            ),
            AgentState(
                agent_id="validator-agent-1",
                name="Data Validation Agent",
                role="Detect conflicts, duplicates and stale observations",
                status="degraded",
                current_task="Reviewing INFY source conflict",
                is_simulated=True,
            ),
            AgentState(
                agent_id="calculator-agent-1",
                name="Dividend Calculation Agent",
                role="Compute deterministic expected dividend income",
                status="online",
                current_task="Calculating portfolio-level estimates",
                is_simulated=True,
            ),
            AgentState(
                agent_id="monitor-agent-1",
                name="Monitoring & Recovery Agent",
                role="Monitor swarm health and recover failed tasks",
                status="online",
                current_task="Monitoring agent heartbeats",
                is_simulated=True,
            ),
        ]

        db.add_all(agent_states)
        db.commit()

        # ============================================================
        # 11. AGENT RUNS
        # ============================================================

        now = utc_now()

        agent_runs = [
            AgentRun(
                id="run-001",
                task_id="task-tcs-collect",
                correlation_id="corr-tcs-001",
                agent_name="Data Collection Agent",
                status="completed",
                started_at=now - timedelta(minutes=18),
                completed_at=now - timedelta(minutes=17),
                summary="Collected matching TCS dividend observations.",
            ),
            AgentRun(
                id="run-002",
                task_id="task-tcs-validate",
                correlation_id="corr-tcs-001",
                agent_name="Data Validation Agent",
                status="completed",
                started_at=now - timedelta(minutes=16),
                completed_at=now - timedelta(minutes=15),
                summary="TCS observations agreed across distributed sources.",
            ),
            AgentRun(
                id="run-003",
                task_id="task-tcs-calculate",
                correlation_id="corr-tcs-001",
                agent_name="Dividend Calculation Agent",
                status="completed",
                started_at=now - timedelta(minutes=14),
                completed_at=now - timedelta(minutes=13),
                summary="Calculated ₹250.00 expected dividend for 25 TCS shares.",
            ),
            AgentRun(
                id="run-004",
                task_id="task-infy-collect",
                correlation_id="corr-infy-001",
                agent_name="Data Collection Agent",
                status="completed",
                started_at=now - timedelta(minutes=12),
                completed_at=now - timedelta(minutes=11),
                summary="Collected two conflicting INFY observations.",
            ),
            AgentRun(
                id="run-005",
                task_id="task-infy-validate",
                correlation_id="corr-infy-001",
                agent_name="Data Validation Agent",
                status="failed",
                started_at=now - timedelta(minutes=10),
                completed_at=now - timedelta(minutes=9),
                summary="Validation halted because source observations disagree.",
            ),
            AgentRun(
                id="run-006",
                task_id="task-infy-retry",
                correlation_id="corr-infy-001",
                agent_name="Monitoring & Recovery Agent",
                status="retrying",
                started_at=now - timedelta(minutes=8),
                completed_at=None,
                summary="Conflict review task reassigned for additional verification.",
            ),
            AgentRun(
                id="run-007",
                task_id="task-calendar-sync",
                correlation_id="corr-calendar-001",
                agent_name="Date Tracking Agent",
                status="running",
                started_at=now - timedelta(minutes=3),
                completed_at=None,
                summary="Synchronizing upcoming dividend dates.",
            ),
            AgentRun(
                id="run-008",
                task_id="task-portfolio-calc",
                correlation_id="corr-portfolio-001",
                agent_name="Dividend Calculation Agent",
                status="completed",
                started_at=now - timedelta(minutes=5),
                completed_at=now - timedelta(minutes=4),
                summary="Calculated expected portfolio dividend income.",
            ),
        ]

        db.add_all(agent_runs)
        db.commit()

        # ============================================================
        # 12. AGENT MESSAGES
        # ============================================================

        messages = [
            AgentMessage(
                id="msg-001",
                run_id="run-001",
                correlation_id="corr-tcs-001",
                sender="collector-agent-1",
                recipient="date-tracker-1",
                message_type="OBSERVATION",
                schema_version="1.0",
                payload={
                    "ticker": "TCS",
                    "dps": 10.00,
                    "source": "BSE Official Disclosure",
                    "confidence": 1.0,
                },
            ),
            AgentMessage(
                id="msg-002",
                run_id="run-001",
                correlation_id="corr-tcs-001",
                sender="collector-agent-1",
                recipient="validator-agent-1",
                message_type="OBSERVATION",
                schema_version="1.0",
                payload={
                    "ticker": "TCS",
                    "dps": 10.00,
                    "source": "BSE Official Disclosure",
                },
            ),
            AgentMessage(
                id="msg-003",
                run_id="run-002",
                correlation_id="corr-tcs-001",
                sender="validator-agent-1",
                recipient="calculator-agent-1",
                message_type="VALIDATION_RESULT",
                schema_version="1.0",
                payload={
                    "ticker": "TCS",
                    "status": "valid",
                    "sources_agree": True,
                },
            ),
            AgentMessage(
                id="msg-004",
                run_id="run-003",
                correlation_id="corr-tcs-001",
                sender="calculator-agent-1",
                recipient="monitor-agent-1",
                message_type="CALCULATION_RESULT",
                schema_version="1.0",
                payload={
                    "ticker": "TCS",
                    "quantity": 25,
                    "dps": 10.00,
                    "expected_dividend": 250.00,
                },
            ),
            AgentMessage(
                id="msg-005",
                run_id="run-004",
                correlation_id="corr-infy-001",
                sender="collector-agent-1",
                recipient="validator-agent-1",
                message_type="OBSERVATION",
                schema_version="1.0",
                payload={
                    "ticker": "INFY",
                    "observations": [
                        {"source": "BSE", "dps": 18.00},
                        {"source": "NSE", "dps": 20.00},
                    ],
                },
            ),
            AgentMessage(
                id="msg-006",
                run_id="run-005",
                correlation_id="corr-infy-001",
                sender="validator-agent-1",
                recipient="monitor-agent-1",
                message_type="VALIDATION_CONFLICT",
                schema_version="1.0",
                payload={
                    "ticker": "INFY",
                    "status": "conflict",
                    "requires_review": True,
                },
            ),
            AgentMessage(
                id="msg-007",
                run_id="run-006",
                correlation_id="corr-infy-001",
                sender="monitor-agent-1",
                recipient="collector-agent-1",
                message_type="TASK_REASSIGNMENT",
                schema_version="1.0",
                payload={
                    "reason": "source conflict",
                    "action": "collect additional observation",
                    "priority": "high",
                },
            ),
            AgentMessage(
                id="msg-008",
                run_id="run-007",
                correlation_id="corr-calendar-001",
                sender="date-tracker-1",
                recipient="monitor-agent-1",
                message_type="HEARTBEAT",
                schema_version="1.0",
                payload={
                    "tracked_events": 6,
                    "upcoming_events": 5,
                    "status": "healthy",
                },
            ),
        ]

        db.add_all(messages)
        db.commit()

        # ============================================================
        # 13. CALCULATION EXPLANATIONS
        # ============================================================

        explanations = [
            CalculationExplanation(
                id="exp-tcs-paid-001",
                event_id=tcs_paid.id,
                explanation_text=(
                    "Your 25 TCS shares generated an estimated ₹225.00 "
                    "dividend. Calculation: 25 shares × ₹9.00 per share. "
                    "The payment was reported as received."
                ),
                provider_used="template",
            ),
            CalculationExplanation(
                id="exp-tcs-up-002",
                event_id=tcs_upcoming.id,
                explanation_text=(
                    "Your 25 TCS shares are expected to generate ₹250.00. "
                    "Calculation: 25 shares × ₹10.00 per share. "
                    "The event has matching distributed observations."
                ),
                provider_used="template",
            ),
            CalculationExplanation(
                id="exp-infy-003",
                event_id=infy_event.id,
                explanation_text=(
                    "INFY requires review because distributed sources "
                    "reported different dividend-per-share values. "
                    "The system does not calculate a final amount until "
                    "the conflict is resolved."
                ),
                provider_used="template",
            ),
            CalculationExplanation(
                id="exp-rel-004",
                event_id=reliance_event.id,
                explanation_text=(
                    "Your 30 Reliance shares generated ₹450.00. "
                    "Calculation: 30 shares × ₹15.00 per share."
                ),
                provider_used="template",
            ),
            CalculationExplanation(
                id="exp-itc-005",
                event_id=itc_event.id,
                explanation_text=(
                    "Your 100 ITC shares are expected to generate ₹750.00. "
                    "Calculation: 100 shares × ₹7.50 per share."
                ),
                provider_used="template",
            ),
            CalculationExplanation(
                id="exp-hdfc-006",
                event_id=hdfc_event.id,
                explanation_text=(
                    "Your 20 HDFC Bank shares are expected to generate "
                    "₹440.00. Calculation: 20 shares × ₹22.00 per share."
                ),
                provider_used="template",
            ),
            CalculationExplanation(
                id="exp-sbi-007",
                event_id=sbi_event.id,
                explanation_text=(
                    "Your 40 SBI shares correspond to an expected dividend "
                    "of ₹548.00. The payment date has passed, but no user "
                    "payment confirmation has been recorded."
                ),
                provider_used="template",
            ),
            CalculationExplanation(
                id="exp-hcl-008",
                event_id=hcl_event.id,
                explanation_text=(
                    "Your 30 HCL Technologies shares are expected to generate "
                    "₹360.00. Calculation: 30 shares × ₹12.00 per share."
                ),
                provider_used="template",
            ),
            CalculationExplanation(
                id="exp-wipro-009",
                event_id=wipro_event.id,
                explanation_text=(
                    "Wipro requires review because the distributed "
                    "observations report different dividend-per-share values."
                ),
                provider_used="template",
            ),
        ]

        db.add_all(explanations)
        db.commit()

        # ============================================================
        # DONE
        # ============================================================

        print("==============================================")
        print("DividendLens database seeded successfully!")
        print("==============================================")
        print("Companies:        8")
        print("Dividend events:  9")
        print("Portfolio holds:  8")
        print("Alerts:            4")
        print("Agent states:      5")
        print("Agent runs:        8")
        print("Agent messages:    8")
        print("Explanations:      9")
        print("Payment reports:   2")
        print("==============================================")
        print("Demo workflow data is ready.")
        print("==============================================")

    finally:
        if close_db_on_exit:
            db.close()


if __name__ == "__main__":
    seed_database()