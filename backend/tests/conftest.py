"""
Pytest configuration and fixtures
"""
import pytest
import asyncio
from typing import AsyncGenerator
from motor.motor_asyncio import AsyncIOMotorClient
from httpx import AsyncClient, ASGITransport
from backend.app import app
from backend.config import settings


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def test_db():
    """Test database fixture"""
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client["test_database_pytest"]

    yield db

    # Cleanup
    await client.drop_database("test_database_pytest")
    client.close()


@pytest.fixture
async def client() -> AsyncGenerator:
    """Test HTTP client"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user(test_db):
    """Create a test user"""
    from backend.services import AuthService

    auth_service = AuthService(test_db)
    user = await auth_service.create_user(
        email="test@example.com", password="testpass123", name="Test User"
    )
    return user


@pytest.fixture
async def auth_headers(test_user):
    """Get auth headers for test user"""
    from backend.services import AuthService

    auth_service = AuthService(None)
    token = auth_service.create_access_token(data={"sub": test_user["email"]})
    return {"Authorization": f"Bearer {token}"}
