"""
Dashboard models
"""
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    """Dashboard summary statistics"""
    total_invested: float
    current_value: float
    total_interest_earned: float
    profit_loss: float
    profit_loss_percentage: float
    total_bonds: int
    maturity_upcoming_30days: int


class ChartDataPoint(BaseModel):
    """Chart data point"""
    date: str
    value: float
