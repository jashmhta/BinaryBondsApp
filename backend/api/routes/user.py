"""
User preference routes
"""
from fastapi import APIRouter, Depends, Body
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.services import AuthService
from backend.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/user", tags=["User"])


@router.post("/update-theme")
async def update_theme(
    theme: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update user theme preference"""
    auth_service = AuthService(db)
    await auth_service.update_theme(current_user["_id"], theme)
    return {"success": True}
