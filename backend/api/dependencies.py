"""
API dependencies
"""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.database import get_database
from backend.services import AuthService

security = HTTPBearer()


def get_db() -> AsyncIOMotorDatabase:
    """Get database dependency"""
    return get_database()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    """Get current authenticated user"""
    token = credentials.credentials

    # Decode token
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)

    email = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )

    # Get user
    user = await auth_service.get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user
