"""
Authentication service
"""
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException
import uuid

from backend.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Authentication service"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(
        data: dict, expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                days=settings.ACCESS_TOKEN_EXPIRE_DAYS
            )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )
        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> dict:
        """Decode JWT token"""
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            return payload
        except JWTError:
            raise HTTPException(
                status_code=401, detail="Invalid authentication credentials"
            )

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email"""
        return await self.db.users.find_one({"email": email})

    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        return await self.db.users.find_one({"_id": user_id})

    async def create_user(
        self, email: str, password: str, name: str, phone: Optional[str] = None
    ) -> dict:
        """Create a new user"""
        # Check if user exists
        existing_user = await self.get_user_by_email(email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Create user document
        user_id = str(uuid.uuid4())
        user = {
            "_id": user_id,
            "email": email,
            "password_hash": self.get_password_hash(password),
            "name": name,
            "phone": phone,
            "pin_hash": None,
            "created_at": datetime.utcnow().isoformat(),
            "preferences": {"theme": "dark", "notifications_enabled": True},
        }

        await self.db.users.insert_one(user)
        return user

    async def authenticate_user(self, email: str, password: str) -> dict:
        """Authenticate user"""
        user = await self.get_user_by_email(email)
        if not user or not self.verify_password(password, user["password_hash"]):
            raise HTTPException(
                status_code=401, detail="Incorrect email or password"
            )
        return user

    async def set_user_pin(self, user_id: str, pin: str) -> bool:
        """Set user PIN"""
        if len(pin) != 4 or not pin.isdigit():
            raise HTTPException(status_code=400, detail="PIN must be 4 digits")

        pin_hash = self.get_password_hash(pin)
        result = await self.db.users.update_one(
            {"_id": user_id}, {"$set": {"pin_hash": pin_hash}}
        )
        return result.modified_count > 0

    async def verify_user_pin(self, user_id: str, pin: str) -> bool:
        """Verify user PIN"""
        user = await self.get_user_by_id(user_id)
        if not user or not user.get("pin_hash"):
            raise HTTPException(status_code=400, detail="PIN not set")

        if not self.verify_password(pin, user["pin_hash"]):
            raise HTTPException(status_code=401, detail="Incorrect PIN")

        return True

    async def update_theme(self, user_id: str, theme: str) -> bool:
        """Update user theme preference"""
        if theme not in ["dark", "light"]:
            raise HTTPException(status_code=400, detail="Invalid theme")

        result = await self.db.users.update_one(
            {"_id": user_id}, {"$set": {"preferences.theme": theme}}
        )
        return result.modified_count > 0
