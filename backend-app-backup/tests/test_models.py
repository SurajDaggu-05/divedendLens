from datetime import date
from sqlalchemy.orm import Session
from app.db.session import engine, Base, SessionLocal
from app.db.models import User, Company, Portfolio, Holding, DividendEvent, EventSource, DataAlert


def setup_module():
    Base.metadata.create_all(bind=engine)


def test_user_portfolio_holding_creation():
    db: Session = SessionLocal()
    try:
        user = User(name="Test User", email="test@example.com", password_hash="hashedpass")
        db.add(user)
        db.commit()
        db.refresh(user)
        assert user.id is not None

        company = Company(ticker="TESTCO", name="Test Company Ltd", exchange="NSE")
        db.add(company)
        db.commit()
        db.refresh(company)

        portfolio = Portfolio(user_id=user.id, name="Test Portfolio")
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

        holding = Holding(portfolio_id=portfolio.id, company_id=company.id, quantity=100, average_price=150.50)
        db.add(holding)
        db.commit()
        db.refresh(holding)

        assert holding.quantity == 100
        assert str(holding.average_price) == "150.50"
    finally:
        db.close()


def test_dividend_event_and_sources():
    db: Session = SessionLocal()
    try:
        company = db.query(Company).filter(Company.ticker == "TESTCO").first()
        event = DividendEvent(
            company_id=company.id,
            event_type="interim",
            dividend_per_share=12.50,
            currency="INR",
            ex_date=date(2026, 10, 15),
            validation_status="valid",
        )
        db.add(event)
        db.commit()
        db.refresh(event)

        source = EventSource(
            event_id=event.id,
            source_name="BSE Disclosure",
            observed_dps=12.50,
            observed_dates={"ex_date": "2026-10-15"},
        )
        db.add(source)
        db.commit()

        fetched = db.query(DividendEvent).filter(DividendEvent.id == event.id).first()
        assert fetched is not None
        assert str(fetched.dividend_per_share) == "12.5000"
        assert len(fetched.sources) == 1
    finally:
        db.close()
