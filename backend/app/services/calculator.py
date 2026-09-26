from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from typing import Dict, Any, Optional
from app.db.models import Holding, DividendEvent


def to_decimal(val: Any) -> Decimal:
    if val is None:
        return Decimal("0.00")
    if isinstance(val, Decimal):
        return val
    return Decimal(str(val))


def format_decimal(val: Decimal) -> str:
    return str(val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


class DividendCalculator:
    @staticmethod
    def calculate_event_estimate(
        holding: Holding,
        event: DividendEvent
    ) -> Dict[str, Any]:
        """
        Calculates the gross dividend estimate for a specific holding and dividend event.
        Returns formula breakdown, eligible shares, gross amount, and calculation status.
        """
        dps = to_decimal(event.dividend_per_share)
        quantity = Decimal(holding.quantity)
        
        # Check event validation state
        if event.validation_status in ["conflict", "failed"]:
            return {
                "eligible_shares": holding.quantity,
                "dividend_per_share": format_decimal(dps),
                "estimated_gross_amount": "0.00",
                "formula": f"{holding.quantity} shares × ₹{format_decimal(dps)} DPS (Data Conflict Detected)",
                "calculation_status": "unavailable",
                "reason": "Dividend data source conflict detected. Requires resolution.",
            }

        # Determine eligibility
        is_provisional = False
        if holding.purchase_date is not None and event.ex_date is not None:
            if holding.purchase_date >= event.ex_date:
                return {
                    "eligible_shares": 0,
                    "dividend_per_share": format_decimal(dps),
                    "estimated_gross_amount": "0.00",
                    "formula": "0 eligible shares (Purchased after ex-dividend date)",
                    "calculation_status": "calculated",
                    "reason": "Shares acquired on or after ex-dividend date.",
                }
        elif holding.purchase_date is None:
            is_provisional = True

        if event.validation_status != "valid":
            is_provisional = True

        # Calculate gross dividend amount
        gross_amount = quantity * dps
        formatted_gross = format_decimal(gross_amount)
        formatted_dps = format_decimal(dps)
        
        status = "provisional" if is_provisional else "calculated"
        
        return {
            "eligible_shares": holding.quantity,
            "dividend_per_share": formatted_dps,
            "estimated_gross_amount": formatted_gross,
            "formula": f"{holding.quantity} eligible shares × ₹{formatted_dps} DPS",
            "calculation_status": status,
            "reason": "Calculation completed using deterministic rules.",
        }

    @staticmethod
    def calculate_portfolio_summary(
        holdings: list[Holding],
        events: list[DividendEvent],
        payment_reports: list[Any] = None
    ) -> Dict[str, Any]:
        """
        Calculates aggregate expected income, received income, upcoming 30 days income,
        and unverified/provisional amounts for a portfolio.
        """
        expected_fy = Decimal("0.00")
        upcoming_30 = Decimal("0.00")
        unverified_amt = Decimal("0.00")
        today = date.today()
        
        # Map holdings by company_id
        holding_map = {h.company_id: h for h in holdings}

        for event in events:
            if event.company_id not in holding_map:
                continue
            
            holding = holding_map[event.company_id]
            calc = DividendCalculator.calculate_event_estimate(holding, event)
            est_gross = to_decimal(calc["estimated_gross_amount"])
            
            if calc["calculation_status"] == "calculated":
                expected_fy += est_gross
            elif calc["calculation_status"] == "provisional":
                expected_fy += est_gross
                unverified_amt += est_gross

            # Upcoming in 30 days
            if event.ex_date and 0 <= (event.ex_date - today).days <= 30:
                upcoming_30 += est_gross

        # Sum user-reported received income
        received_fy = Decimal("0.00")
        if payment_reports:
            for pr in payment_reports:
                received_fy += to_decimal(pr.amount_received)

        return {
            "currency": "INR",
            "expected_income_fy": format_decimal(expected_fy),
            "received_income_fy": format_decimal(received_fy),
            "upcoming_30_days": format_decimal(upcoming_30),
            "unverified_amount": format_decimal(unverified_amt),
        }
