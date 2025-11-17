"""
Notification service
"""
import uuid
from datetime import datetime
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException


class NotificationService:
    """Notification management service"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_user_notifications(self, user_id: str) -> List[dict]:
        """Get user notifications"""
        notifications = (
            await self.db.notifications.find({"user_id": user_id})
            .sort("date", -1)
            .to_list(1000)
        )
        return notifications

    async def create_notification(
        self, user_id: str, notification_type: str, title: str, message: str
    ) -> dict:
        """Create a notification"""
        notification = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "date": datetime.utcnow().isoformat(),
            "is_read": False,
        }

        await self.db.notifications.insert_one(notification)
        return notification

    async def mark_as_read(self, user_id: str, notification_id: str) -> bool:
        """Mark notification as read"""
        result = await self.db.notifications.update_one(
            {"_id": notification_id, "user_id": user_id}, {"$set": {"is_read": True}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")

        return True

    async def mark_all_as_read(self, user_id: str) -> bool:
        """Mark all notifications as read"""
        await self.db.notifications.update_many(
            {"user_id": user_id}, {"$set": {"is_read": True}}
        )
        return True

    async def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        count = await self.db.notifications.count_documents(
            {"user_id": user_id, "is_read": False}
        )
        return count
