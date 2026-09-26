from decimal import Decimal
from datetime import date
from app.db.models import Holding, DividendEvent, Company
from app.services.calculator import DividendCalculator, format_decimal, to_decimal


def test_to_decimal_and_format_decimal():
    assert to_decimal("12.5") == Decimal("12.5")
    assert format_decimal(Decimal("250.0000")) == "250.00"
    assert format_decimal(Decimal("10.00")) == "10.00"


def test_calculate_event_estimate_happy_path():
    holding = Holding(quantity=25, purchase_date=date(2026, 1, 15))
    event = DividendEvent(
        dividend_per_share=Decimal("10.00"),
        ex_date=date(2026, 10, 10),
        validation_status="valid"
    )

    calc = DividendCalculator.calculate_event_estimate(holding, event)
    assert calc["eligible_shares"] == 25
    assert calc["dividend_per_share"] == "10.00"
    assert calc["estimated_gross_amount"] == "250.00"
    assert calc["calculation_status"] == "calculated"


def test_calculate_event_estimate_conflict_status():
    holding = Holding(quantity=50, purchase_date=date(2026, 3, 10))
    event = DividendEvent(
        dividend_per_share=Decimal("18.00"),
        ex_date=date(2026, 10, 15),
        validation_status="conflict"
    )

    calc = DividendCalculator.calculate_event_estimate(holding, event)
    assert calc["estimated_gross_amount"] == "0.00"
    assert calc["calculation_status"] == "unavailable"
    assert "Data Conflict Detected" in calc["formula"]


def test_calculate_event_estimate_provisional_assumption():
    # Purchase date is None -> assume current quantity eligible & mark provisional
    holding = Holding(quantity=30, purchase_date=None)
    event = DividendEvent(
        dividend_per_share=Decimal("15.00"),
        ex_date=date(2026, 11, 1),
        validation_status="valid"
    )

    calc = DividendCalculator.calculate_event_estimate(holding, event)
    assert calc["eligible_shares"] == 30
    assert calc["estimated_gross_amount"] == "450.00"
    assert calc["calculation_status"] == "provisional"


def test_calculate_event_estimate_ineligible_purchase_date():
    # Purchased on or after ex-dividend date -> 0 eligible shares
    holding = Holding(quantity=40, purchase_date=date(2026, 10, 10))
    event = DividendEvent(
        dividend_per_share=Decimal("10.00"),
        ex_date=date(2026, 10, 10),
        validation_status="valid"
    )

    calc = DividendCalculator.calculate_event_estimate(holding, event)
    assert calc["eligible_shares"] == 0
    assert calc["estimated_gross_amount"] == "0.00"
    assert calc["calculation_status"] == "calculated"
