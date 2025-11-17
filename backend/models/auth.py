"""
Authentication models
"""
from pydantic import BaseModel


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"


class PINSetup(BaseModel):
    """PIN setup request"""
    pin: str


class PINVerify(BaseModel):
    """PIN verification request"""
    pin: str
