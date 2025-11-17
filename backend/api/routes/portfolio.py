"""
Portfolio routes
"""
from fastapi import APIRouter, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.models import UserBondResponse, Bond
from backend.services import PortfolioService
from backend.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/list", response_model=List[UserBondResponse])
async def get_portfolio(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get user's bond portfolio"""
    portfolio_service = PortfolioService(db)
    return await portfolio_service.get_user_portfolio(current_user["_id"])


@router.get("/bond/{bond_id}")
async def get_bond_detail(
    bond_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get bond detail with user data"""
    portfolio_service = PortfolioService(db)
    return await portfolio_service.get_bond_detail(bond_id, current_user["_id"])


@router.get("/all-bonds", response_model=List[Bond])
async def get_all_bonds(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get all available bonds"""
    portfolio_service = PortfolioService(db)
    return await portfolio_service.get_all_bonds()
