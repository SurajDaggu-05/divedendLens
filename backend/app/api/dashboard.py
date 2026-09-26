from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Portfolio, Holding, DividendEvent, Company, DataAlert, PaymentReport
from app.core.security import get_current_user
from app.services.calculator import DividendCalculator, format_decimal

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview")
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolios = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    portfolio_ids = [p.id for p in portfolios]
    holdings = db.query(Holding).filter(Holding.portfolio_id.in_(portfolio_ids)).all() if portfolio_ids else []
    
    company_ids = list(set([h.company_id for h in holdings]))
    events = db.query(DividendEvent).filter(DividendEvent.company_id.in_(company_ids)).all() if company_ids else []
    payment_reports = db.query(PaymentReport).filter(PaymentReport.user_id == current_user.id).all()

    summary = DividendCalculator.calculate_portfolio_summary(holdings, events, payment_reports)
    
    # Upcoming events list
    upcoming_list = []
    for event in events:
        company = db.query(Company).filter(Company.id == event.company_id).first()
        holding = next((h for h in holdings if h.company_id == event.company_id), None)
        if holding:
            calc = DividendCalculator.calculate_event_estimate(holding, event)
            upcoming_list.append({
                "event_id": event.id,
                "company_ticker": company.ticker if company else "",
                "company_name": company.name if company else "",
                "ex_date": event.ex_date,
                "dividend_per_share": format_decimal(event.dividend_per_share),
                "eligible_shares": holding.quantity,
                "estimated_gross_amount": calc["estimated_gross_amount"],
                "status": event.business_status,
            })

    alerts_count = db.query(DataAlert).filter(DataAlert.is_resolved == False).count()

    return {
        "success": True,
        "data": {
            "is_demo_data": True,
            "metrics": {
                "expected_income_fy": summary["expected_income_fy"],
                "received_income_fy": summary["received_income_fy"],
                "upcoming_30_days": summary["upcoming_30_days"],
                "currency": "INR",
            },
            "upcoming_events": upcoming_list,
            "alerts_count": alerts_count,
            "agent_system_health": "healthy",
            "last_updated_at": datetime.now(timezone.utc),
        }
    }
