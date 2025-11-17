"""
Configuration management for BinaryBonds API
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


class Settings(BaseSettings):
    """Application settings"""

    # API Settings
    APP_NAME: str = "BinaryBonds API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api"

    # Security Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS Settings
    CORS_ORIGINS: list[str] = ["http://localhost:19006", "http://localhost:8081"]
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: list[str] = ["GET", "POST", "PUT", "DELETE"]
    CORS_HEADERS: list[str] = ["*"]

    # Database Settings
    MONGO_URL: str
    DB_NAME: str

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    WORKERS: int = 4

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    LOGIN_RATE_LIMIT: str = "5/minute"
    API_RATE_LIMIT: str = "100/minute"

    # AWS Settings (Optional)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = "ap-south-1"

    # Email Settings (Optional)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


def get_settings() -> Settings:
    """Get application settings"""
    return Settings()


settings = get_settings()
