from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, DividendEvent, EventSource, Company, Holding, PaymentReport, Portfolio
from app.core.security import get_current_user
from app.schemas.dividend import PaymentReportRequest
from app.services.calculator import DividendCalculator, format_decimal

router = APIRouter(prefix="/dividends", tags=["Dividends"])


@router.get("")
def list_dividends(
    company_ticker: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    validation_status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(DividendEvent)
    
    if company_ticker:
        company = db.query(Company).filter(Company.ticker == company_ticker.upper()).first()
        if company:
            query = query.filter(DividendEvent.company_id == company.id)
        else:
            return {"success": True, "data": [], "meta": {"page": page, "limit": limit, "total": 0, "total_pages": 0}}
            
    if status:
        query = query.filter(DividendEvent.business_status == status)
    if validation_status:
        query = query.filter(DividendEvent.validation_status == validation_status)

    total = query.count()
    events = query.offset((page - 1) * limit).limit(limit).all()

    res = []
    for event in events:
        company = db.query(Company).filter(Company.id == event.company_id).first()
        res.append({
            "id": event.id,
            "company": {
                "ticker": company.ticker if company else "",
                "name": company.name if company else "",
            },
            "event_type": event.event_type,
            "dividend_per_share": format_decimal(event.dividend_per_share),
            "currency": event.currency,
            "announcement_date": event.announcement_date,
            "ex_date": event.ex_date,
            "record_date": event.record_date,
            "payment_date": event.payment_date,
            "business_status": event.business_status,
            "validation_status": event.validation_status,
            "is_demo_data": event.is_demo_data,
            "last_validated_at": event.updated_at,
        })

    total_pages = (total + limit - 1) // limit if total > 0 else 0
    return {
        "success": True,
        "data": res,
        "meta": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages
        }
    }


@router.get("/{event_id}")
def get_dividend_detail(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(DividendEvent).filter(DividendEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Dividend event not found.")

    company = db.query(Company).filter(Company.id == event.company_id).first()
    sources = db.query(EventSource).filter(EventSource.event_id == event.id).all()

    # Find user holding if available
    portfolios = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    portfolio_ids = [p.id for p in portfolios]
    holding = db.query(Holding).filter(
        Holding.portfolio_id.in_(portfolio_ids), Holding.company_id == event.company_id
    ).first() if portfolio_ids else None

    calc_data = None
    if holding:
        calc = DividendCalculator.calculate_event_estimate(holding, event)
        calc_data = {
            "eligible_shares": calc["eligible_shares"],
            "dividend_per_share": calc["dividend_per_share"],
            "estimated_gross_amount": calc["estimated_gross_amount"],
            "formula": calc["formula"],
            "calculation_status": calc["calculation_status"],
            "calculated_at": datetime.now(timezone.utc),
        }

    sources_data = [
        {
            "id": s.id,
            "source_name": s.source_name,
            "source_url": s.source_url,
            "observed_dps": format_decimal(s.observed_dps),
            "observed_at": s.observed_at,
        }
        for s in sources
    ]

    return {
        "success": True,
        "data": {
            "id": event.id,
            "company": {
                "ticker": company.ticker if company else "",
                "name": company.name if company else "",
            },
            "event_type": event.event_type,
            "dividend_per_share": format_decimal(event.dividend_per_share),
            "currency": event.currency,
            "dates": {
                "announcement_date": event.announcement_date,
                "ex_date": event.ex_date,
                "record_date": event.record_date,
                "payment_date": event.payment_date,
            },
            "business_status": event.business_status,
            "validation_status": event.validation_status,
            "is_demo_data": event.is_demo_data,
            "calculation": calc_data,
            "sources": sources_data,
        }
    }


@router.post("/{event_id}/payment-reports", status_code=status.HTTP_201_CREATED)
def report_payment_received(
    event_id: str,
    req: PaymentReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(DividendEvent).filter(DividendEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Dividend event not found.")

    report = PaymentReport(
        user_id=current_user.id,
        event_id=event.id,
        amount_received=req.amount_received,
        received_date=req.received_date,
        notes=req.notes,
        status="received_user_reported",
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "success": True,
        "data": {
            "id": report.id,
            "event_id": report.event_id,
            "amount_received": format_decimal(report.amount_received),
            "received_date": report.received_date,
            "status": report.status,
            "notes": report.notes,
            "created_at": report.created_at,
        }
    }
