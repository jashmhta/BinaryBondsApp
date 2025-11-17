"""
Dashboard routes
"""
from fastapi import APIRouter, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.models import DashboardSummary, ChartDataPoint
from backend.services import PortfolioService
from backend.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get dashboard summary statistics"""
    portfolio_service = PortfolioService(db)
    return await portfolio_service.get_dashboard_summary(current_user["_id"])


@router.get("/chart", response_model=List[ChartDataPoint])
async def get_dashboard_chart(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get 6-month portfolio growth chart data"""
    portfolio_service = PortfolioService(db)
    return await portfolio_service.get_portfolio_chart_data(current_user["_id"])
