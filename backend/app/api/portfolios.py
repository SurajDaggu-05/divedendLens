from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Portfolio, Holding, Company, DividendEvent, PaymentReport
from app.core.security import get_current_user
from app.schemas.portfolio import (
    PortfolioCreateRequest, PortfolioUpdateRequest, HoldingCreateRequest, HoldingUpdateRequest
)
from app.services.calculator import DividendCalculator, format_decimal

router = APIRouter(tags=["Portfolios"])


@router.get("/portfolios")
def list_portfolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolios = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    res = []
    for p in portfolios:
        count = db.query(Holding).filter(Holding.portfolio_id == p.id).count()
        res.append({
            "id": p.id,
            "name": p.name,
            "holdings_count": count,
            "created_at": p.created_at,
        })
    return {"success": True, "data": res}


@router.post("/portfolios", status_code=status.HTTP_201_CREATED)
def create_portfolio(
    req: PortfolioCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = Portfolio(
        user_id=current_user.id,
        name=req.name,
        description=req.description,
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return {
        "success": True,
        "data": {
            "id": portfolio.id,
            "name": portfolio.name,
            "holdings_count": 0,
            "created_at": portfolio.created_at,
        }
    }


@router.get("/portfolios/{portfolio_id}")
def get_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    
    count = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).count()
    return {
        "success": True,
        "data": {
            "id": portfolio.id,
            "name": portfolio.name,
            "holdings_count": count,
            "created_at": portfolio.created_at,
        }
    }


@router.patch("/portfolios/{portfolio_id}")
def update_portfolio(
    portfolio_id: str,
    req: PortfolioUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    
    portfolio.name = req.name
    db.commit()
    db.refresh(portfolio)
    count = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).count()
    return {
        "success": True,
        "data": {
            "id": portfolio.id,
            "name": portfolio.name,
            "holdings_count": count,
            "created_at": portfolio.created_at,
        }
    }


@router.delete("/portfolios/{portfolio_id}")
def delete_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
    
    db.delete(portfolio)
    db.commit()
    return {"success": True, "data": {"message": "Portfolio deleted successfully."}}


@router.get("/portfolios/{portfolio_id}/summary")
def get_portfolio_summary(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
    company_ids = [h.company_id for h in holdings]
    events = db.query(DividendEvent).filter(DividendEvent.company_id.in_(company_ids)).all() if company_ids else []
    payment_reports = db.query(PaymentReport).filter(PaymentReport.user_id == current_user.id).all()

    summary = DividendCalculator.calculate_portfolio_summary(holdings, events, payment_reports)
    summary["portfolio_id"] = portfolio.id
    summary["last_calculated_at"] = datetime.now(timezone.utc)
    return {"success": True, "data": summary}


@router.get("/portfolios/{portfolio_id}/holdings")
def list_holdings(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    holdings = db.query(Holding).filter(Holding.portfolio_id == portfolio.id).all()
    res = []
    for h in holdings:
        company = db.query(Company).filter(Company.id == h.company_id).first()
        upcoming = db.query(DividendEvent).filter(
            DividendEvent.company_id == h.company_id
        ).order_by(DividendEvent.ex_date.asc()).first()
        
        upcoming_data = None
        if upcoming:
            calc = DividendCalculator.calculate_event_estimate(h, upcoming)
            upcoming_data = {
                "event_id": upcoming.id,
                "ex_date": upcoming.ex_date,
                "dividend_per_share": format_decimal(upcoming.dividend_per_share),
                "estimated_gross_amount": calc["estimated_gross_amount"],
                "status": upcoming.business_status,
            }

        res.append({
            "id": h.id,
            "portfolio_id": h.portfolio_id,
            "company": {
                "id": company.id if company else "",
                "ticker": company.ticker if company else "",
                "name": company.name if company else "",
                "exchange": company.exchange if company else "NSE",
            },
            "quantity": h.quantity,
            "average_price": format_decimal(h.average_price) if h.average_price else None,
            "purchase_date": h.purchase_date,
            "upcoming_event": upcoming_data,
        })
    return {"success": True, "data": res}


@router.post("/portfolios/{portfolio_id}/holdings", status_code=status.HTTP_201_CREATED)
def add_holding(
    portfolio_id: str,
    req: HoldingCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    company = db.query(Company).filter(Company.ticker == req.ticker.upper()).first()
    if not company:
        raise HTTPException(status_code=422, detail=f"Company ticker '{req.ticker}' not found in catalog.")

    holding = Holding(
        portfolio_id=portfolio.id,
        company_id=company.id,
        quantity=req.quantity,
        average_price=req.average_price,
        purchase_date=req.purchase_date,
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)

    return {
        "success": True,
        "data": {
            "id": holding.id,
            "portfolio_id": holding.portfolio_id,
            "company": {
                "id": company.id,
                "ticker": company.ticker,
                "name": company.name,
                "exchange": company.exchange,
            },
            "quantity": holding.quantity,
            "average_price": format_decimal(holding.average_price) if holding.average_price else None,
            "purchase_date": holding.purchase_date,
        }
    }


@router.patch("/holdings/{holding_id}")
def update_holding(
    holding_id: str,
    req: HoldingUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    holding = db.query(Holding).filter(Holding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found.")

    if req.quantity is not None:
        holding.quantity = req.quantity
    if req.average_price is not None:
        holding.average_price = req.average_price

    db.commit()
    db.refresh(holding)
    company = db.query(Company).filter(Company.id == holding.company_id).first()

    return {
        "success": True,
        "data": {
            "id": holding.id,
            "portfolio_id": holding.portfolio_id,
            "company": {
                "id": company.id if company else "",
                "ticker": company.ticker if company else "",
                "name": company.name if company else "",
            },
            "quantity": holding.quantity,
            "average_price": format_decimal(holding.average_price) if holding.average_price else None,
            "purchase_date": holding.purchase_date,
        }
    }


@router.delete("/holdings/{holding_id}")
def delete_holding(
    holding_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    holding = db.query(Holding).filter(Holding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found.")

    db.delete(holding)
    db.commit()
    return {"success": True, "data": {"message": "Holding deleted successfully."}}
