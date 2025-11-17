"""
Transaction models
"""
from pydantic import BaseModel, Field
from typing import Optional


class TransactionBase(BaseModel):
    """Base transaction model"""
    bond_id: str
    transaction_type: str  # Buy, Sell
    quantity: int
    price: float
    date: str
    contract_note: Optional[str] = None


class TransactionCreate(TransactionBase):
    """Transaction creation model"""
    pass


class TransactionResponse(BaseModel):
    """Transaction response model"""
    id: str = Field(alias="_id")
    bond_name: str
    isin: str
    transaction_type: str
    quantity: int
    price: float
    total_amount: float
    gst_amount: float
    date: str
    contract_note: Optional[str] = None

    class Config:
        populate_by_name = True


class Transaction(TransactionResponse):
    """Complete transaction model (internal)"""
    user_id: str
    bond_id: str
