"""
User models
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserPreferences(BaseModel):
    """User preferences"""
    theme: str = "dark"
    notifications_enabled: bool = True


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    name: str
    phone: Optional[str] = None


class UserRegister(UserBase):
    """User registration model"""
    password: str


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str


class UserResponse(UserBase):
    """User response model"""
    id: str = Field(alias="_id")
    has_pin: bool
    preferences: UserPreferences
    created_at: Optional[datetime] = None

    class Config:
        populate_by_name = True


class User(UserBase):
    """Complete user model (internal)"""
    id: str = Field(alias="_id")
    password_hash: str
    pin_hash: Optional[str] = None
    created_at: datetime
    preferences: UserPreferences

    class Config:
        populate_by_name = True
