"""
Reports routes
"""
from fastapi import APIRouter, Depends
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.services import PortfolioService, ReportService
from backend.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/portfolio-summary")
async def get_portfolio_summary_report(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Generate portfolio summary PDF report"""
    report_service = ReportService(db)
    buffer = await report_service.generate_portfolio_summary_pdf(
        user_id=current_user["_id"],
        user_name=current_user["name"],
        user_email=current_user["email"],
    )

    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=portfolio_summary.pdf"},
    )


@router.get("/maturity-calendar")
async def get_maturity_calendar(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get maturity calendar"""
    portfolio_service = PortfolioService(db)
    return await portfolio_service.get_maturity_calendar(current_user["_id"])
