"""
Transaction routes
"""
from fastapi import APIRouter, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.models import TransactionResponse, TransactionCreate
from backend.services import TransactionService
from backend.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/list", response_model=List[TransactionResponse])
async def get_transactions(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get user transaction history"""
    transaction_service = TransactionService(db)
    return await transaction_service.get_user_transactions(current_user["_id"])


@router.post("/create")
async def create_transaction(
    transaction: TransactionCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a new transaction"""
    transaction_service = TransactionService(db)
    return await transaction_service.create_transaction(
        user_id=current_user["_id"],
        bond_id=transaction.bond_id,
        transaction_type=transaction.transaction_type,
        quantity=transaction.quantity,
        price=transaction.price,
        date=transaction.date,
        contract_note=transaction.contract_note,
    )
