"""
Authentication tests
"""
import pytest
from httpx import AsyncClient


class TestAuth:
    """Test authentication endpoints"""

    @pytest.mark.asyncio
    async def test_register(self, client: AsyncClient):
        """Test user registration"""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "password123",
                "name": "New User",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient, test_user):
        """Test registration with duplicate email"""
        response = await client.post(
            "/api/auth/register",
            json={
                "email": test_user["email"],
                "password": "password123",
                "name": "Duplicate User",
            },
        )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_login(self, client: AsyncClient, test_user):
        """Test user login"""
        response = await client.post(
            "/api/auth/login",
            json={"email": test_user["email"], "password": "testpass123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, test_user):
        """Test login with wrong password"""
        response = await client.post(
            "/api/auth/login",
            json={"email": test_user["email"], "password": "wrongpassword"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_me(self, client: AsyncClient, auth_headers):
        """Test get current user"""
        response = await client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "name" in data

    @pytest.mark.asyncio
    async def test_get_me_unauthorized(self, client: AsyncClient):
        """Test get current user without auth"""
        response = await client.get("/api/auth/me")
        assert response.status_code == 403  # No auth header

    @pytest.mark.asyncio
    async def test_set_pin(self, client: AsyncClient, auth_headers):
        """Test setting PIN"""
        response = await client.post(
            "/api/auth/set-pin", json={"pin": "1234"}, headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["success"] is True

    @pytest.mark.asyncio
    async def test_set_invalid_pin(self, client: AsyncClient, auth_headers):
        """Test setting invalid PIN"""
        response = await client.post(
            "/api/auth/set-pin", json={"pin": "12"}, headers=auth_headers
        )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_verify_pin(self, client: AsyncClient, auth_headers):
        """Test PIN verification"""
        # First set PIN
        await client.post("/api/auth/set-pin", json={"pin": "1234"}, headers=auth_headers)

        # Then verify
        response = await client.post(
            "/api/auth/verify-pin", json={"pin": "1234"}, headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["success"] is True

    @pytest.mark.asyncio
    async def test_verify_wrong_pin(self, client: AsyncClient, auth_headers):
        """Test PIN verification with wrong PIN"""
        # First set PIN
        await client.post("/api/auth/set-pin", json={"pin": "1234"}, headers=auth_headers)

        # Then verify with wrong PIN
        response = await client.post(
            "/api/auth/verify-pin", json={"pin": "9999"}, headers=auth_headers
        )
        assert response.status_code == 401
