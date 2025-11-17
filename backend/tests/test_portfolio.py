"""
Portfolio service tests
"""
import pytest
from backend.services import PortfolioService


class TestPortfolioCalculations:
    """Test portfolio calculation methods"""

    def test_calculate_interest_accrued(self):
        """Test interest calculation"""
        interest = PortfolioService.calculate_interest_accrued(
            face_value=100000, quantity=10, coupon_rate=7.5, purchase_date="2024-01-01"
        )
        assert interest > 0
        assert isinstance(interest, float)

    def test_calculate_current_value(self):
        """Test current value calculation"""
        current_value = PortfolioService.calculate_current_value(
            face_value=100000, quantity=10, interest_accrued=50000
        )
        assert current_value == 1050000  # (100000 * 10) + 50000

    def test_calculate_profit_loss(self):
        """Test P&L calculation"""
        result = PortfolioService.calculate_profit_loss(
            current_value=1050000, invested_amount=1000000
        )
        assert result["profit_loss"] == 50000
        assert result["profit_loss_percentage"] == 5.0

    def test_calculate_profit_loss_negative(self):
        """Test P&L calculation with loss"""
        result = PortfolioService.calculate_profit_loss(
            current_value=950000, invested_amount=1000000
        )
        assert result["profit_loss"] == -50000
        assert result["profit_loss_percentage"] == -5.0

    def test_calculate_next_payout_date(self):
        """Test next payout date calculation"""
        payout = PortfolioService.calculate_next_payout_date(
            purchase_date="2024-01-01", interest_frequency="Annual"
        )
        assert payout is not None
        assert isinstance(payout, str)
