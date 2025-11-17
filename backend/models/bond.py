"""
Bond models
"""
from pydantic import BaseModel, Field
from typing import Optional


class BondRatings(BaseModel):
    """Bond credit ratings"""
    crisil: Optional[str] = None
    icra: Optional[str] = None
    care: Optional[str] = None
    india_ratings: Optional[str] = None


class BondBase(BaseModel):
    """Base bond model"""
    isin: str
    name: str
    bond_type: str  # G-Sec, Corporate, SDL, Tax-Free
    issuer: str
    face_value: float
    coupon_rate: float
    maturity_date: str
    ratings: BondRatings
    interest_frequency: str  # Annual, Semi-Annual, Quarterly
    is_secured: bool
    category: str
    yield_to_maturity: float
    description: str


class Bond(BondBase):
    """Complete bond model"""
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
