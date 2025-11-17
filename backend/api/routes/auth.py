"""
Authentication routes
"""
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.models import (
    UserRegister,
    UserLogin,
    Token,
    PINSetup,
    PINVerify,
    UserResponse,
)
from backend.services import AuthService
from backend.services.seed_service import SeedService
from backend.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
async def register(
    user_data: UserRegister, db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Register a new user"""
    auth_service = AuthService(db)

    # Create user
    user = await auth_service.create_user(
        email=user_data.email,
        password=user_data.password,
        name=user_data.name,
        phone=user_data.phone,
    )

    # Seed sample data
    seed_service = SeedService(db)
    await seed_service.seed_sample_data(user["_id"])

    # Create token
    access_token = auth_service.create_access_token(data={"sub": user_data.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Login user"""
    auth_service = AuthService(db)

    # Authenticate user
    user = await auth_service.authenticate_user(
        credentials.email, credentials.password
    )

    # Create token
    access_token = auth_service.create_access_token(data={"sub": credentials.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/set-pin")
async def set_pin(
    pin_data: PINSetup,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Set user PIN"""
    auth_service = AuthService(db)
    await auth_service.set_user_pin(current_user["_id"], pin_data.pin)
    return {"success": True, "message": "PIN set successfully"}


@router.post("/verify-pin")
async def verify_pin(
    pin_data: PINVerify,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Verify user PIN"""
    auth_service = AuthService(db)
    await auth_service.verify_user_pin(current_user["_id"], pin_data.pin)
    return {"success": True, "message": "PIN verified"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return {
        "_id": current_user["_id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "phone": current_user.get("phone"),
        "has_pin": current_user.get("pin_hash") is not None,
        "preferences": current_user.get("preferences", {}),
        "created_at": current_user.get("created_at"),
    }
