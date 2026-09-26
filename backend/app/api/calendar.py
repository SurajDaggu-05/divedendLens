from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Portfolio, Holding, DividendEvent, Company
from app.core.security import get_current_user
from app.services.calculator import DividendCalculator, format_decimal

router = APIRouter(prefix="/calendar", tags=["Calendar"])


@router.get("")
def get_calendar_events(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    portfolio_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if portfolio_id:
        portfolios = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id).all()
    else:
        portfolios = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()

    portfolio_ids = [p.id for p in portfolios]
    holdings = db.query(Holding).filter(Holding.portfolio_id.in_(portfolio_ids)).all() if portfolio_ids else []
    company_ids = list(set([h.company_id for h in holdings]))

    query = db.query(DividendEvent)
    if company_ids:
        query = query.filter(DividendEvent.company_id.in_(company_ids))
    
    events = query.all()

    res = []
    for event in events:
        company = db.query(Company).filter(Company.id == event.company_id).first()
        holding = next((h for h in holdings if h.company_id == event.company_id), None)
        
        est_amount = "0.00"
        if holding:
            calc = DividendCalculator.calculate_event_estimate(holding, event)
            est_amount = calc["estimated_gross_amount"]

        # Add Ex-Date entry
        if event.ex_date:
            if (not start_date or event.ex_date >= start_date) and (not end_date or event.ex_date <= end_date):
                res.append({
                    "event_id": event.id,
                    "company_ticker": company.ticker if company else "",
                    "date": event.ex_date,
                    "date_type": "ex_date",
                    "dividend_per_share": format_decimal(event.dividend_per_share),
                    "estimated_gross_amount": est_amount,
                    "validation_status": event.validation_status,
                    "business_status": event.business_status,
                })

        # Add Payment-Date entry
        if event.payment_date:
            if (not start_date or event.payment_date >= start_date) and (not end_date or event.payment_date <= end_date):
                res.append({
                    "event_id": event.id,
                    "company_ticker": company.ticker if company else "",
                    "date": event.payment_date,
                    "date_type": "payment_date",
                    "dividend_per_share": format_decimal(event.dividend_per_share),
                    "estimated_gross_amount": est_amount,
                    "validation_status": event.validation_status,
                    "business_status": event.business_status,
                })

    # Sort entries by date ascending
    res.sort(key=lambda x: x["date"])

    return {"success": True, "data": res}
