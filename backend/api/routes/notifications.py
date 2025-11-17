"""
Notification routes
"""
from fastapi import APIRouter, Depends
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.models import Notification
from backend.services import NotificationService
from backend.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/list", response_model=List[Notification])
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get user notifications"""
    notification_service = NotificationService(db)
    return await notification_service.get_user_notifications(current_user["_id"])


@router.post("/mark-read/{notification_id}")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Mark notification as read"""
    notification_service = NotificationService(db)
    await notification_service.mark_as_read(current_user["_id"], notification_id)
    return {"success": True}


@router.post("/mark-all-read")
async def mark_all_notifications_read(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Mark all notifications as read"""
    notification_service = NotificationService(db)
    await notification_service.mark_all_as_read(current_user["_id"])
    return {"success": True}


@router.get("/unread-count")
async def get_unread_count(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get count of unread notifications"""
    notification_service = NotificationService(db)
    count = await notification_service.get_unread_count(current_user["_id"])
    return {"count": count}
