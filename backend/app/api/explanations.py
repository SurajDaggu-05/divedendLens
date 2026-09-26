from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import DividendEvent, Company, EventSource, CalculationExplanation
from app.core.security import get_current_user
from app.services.calculator import format_decimal

router = APIRouter(prefix="/explanations", tags=["Explanations"])


@router.get("/event/{event_id}")
def get_event_explanation(
    event_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(DividendEvent).filter(DividendEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Dividend event not found.")

    company = db.query(Company).filter(Company.id == event.company_id).first()
    source = db.query(EventSource).filter(EventSource.event_id == event.id).first()

    explanation = db.query(CalculationExplanation).filter(CalculationExplanation.event_id == event.id).first()
    if explanation:
        text = explanation.explanation_text
        provider = explanation.provider_used
    else:
        comp_name = company.name if company else "the company"
        ticker = company.ticker if company else ""
        dps_fmt = format_decimal(event.dividend_per_share)
        src_name = source.source_name if source else "corporate disclosures"
        ex_fmt = event.ex_date.strftime("%d %b %Y") if event.ex_date else "Not available"
        text = (
            f"Based on your shares of {ticker} ({comp_name}), your estimated gross dividend is "
            f"calculated as your share quantity × ₹{dps_fmt} per share announced for this event. "
            f"The ex-dividend date is {ex_fmt}. Verified from {src_name}."
        )
        provider = "template"

    return {
        "success": True,
        "data": {
            "event_id": event.id,
            "company_ticker": company.ticker if company else "",
            "explanation_text": text,
            "provider_used": provider,
            "generated_at": datetime.now(timezone.utc),
        }
    }
