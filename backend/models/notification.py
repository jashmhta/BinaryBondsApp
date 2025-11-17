"""
Notification models
"""
from pydantic import BaseModel, Field


class NotificationBase(BaseModel):
    """Base notification model"""
    type: str  # interest_payout, maturity_alert, rating_change
    title: str
    message: str


class NotificationCreate(NotificationBase):
    """Notification creation model"""
    pass


class Notification(NotificationBase):
    """Complete notification model"""
    id: str = Field(alias="_id")
    date: str
    is_read: bool

    class Config:
        populate_by_name = True
