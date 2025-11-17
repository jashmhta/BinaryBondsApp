"""
Portfolio models
"""
from pydantic import BaseModel, Field
from typing import Optional
from .bond import Bond


class UserBondBase(BaseModel):
    """Base user bond model"""
    quantity: int
    purchase_date: str
    purchase_price: float
    invested_amount: float


class UserBondResponse(UserBondBase):
    """User bond response with calculations"""
    id: str = Field(alias="_id")
    bond: Bond
    current_value: float
    next_payout_date: Optional[str] = None
    profit_loss: float
    profit_loss_percentage: float

    class Config:
        populate_by_name = True


class UserBond(UserBondBase):
    """Complete user bond model (internal)"""
    id: str = Field(alias="_id")
    user_id: str
    bond_id: str

    class Config:
        populate_by_name = True
