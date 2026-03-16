"""Tests for authentication endpoints."""
import pytest


class TestRegister:
    def test_register_success(self, client):
        res = client.post("/api/auth/register", json={
            "email": "new@example.com",
            "password": "securepass",
            "full_name": "New User",
        })
        assert res.status_code == 201
        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_register_duplicate_email(self, client):
        payload = {"email": "dup@example.com", "password": "pass123", "full_name": "Dup"}
        client.post("/api/auth/register", json=payload)
        res = client.post("/api/auth/register", json=payload)
        assert res.status_code == 409
        assert "already registered" in res.json()["detail"]

    def test_register_short_password(self, client):
        res = client.post("/api/auth/register", json={
            "email": "short@example.com",
            "password": "12345",
            "full_name": "Short Pass",
        })
        assert res.status_code == 422

    def test_register_missing_fields(self, client):
        res = client.post("/api/auth/register", json={"email": "x@x.com"})
        assert res.status_code == 422

    def test_register_email_case_insensitive(self, client):
        client.post("/api/auth/register", json={
            "email": "Upper@Example.com",
            "password": "pass123",
            "full_name": "Upper",
        })
        res = client.post("/api/auth/register", json={
            "email": "upper@example.com",
            "password": "pass123",
            "full_name": "Upper Again",
        })
        assert res.status_code == 409


class TestLogin:
    def test_login_success(self, client):
        client.post("/api/auth/register", json={
            "email": "login@example.com",
            "password": "mypassword",
            "full_name": "Login User",
        })
        res = client.post("/api/auth/login", json={
            "email": "login@example.com",
            "password": "mypassword",
        })
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_login_wrong_password(self, client):
        client.post("/api/auth/register", json={
            "email": "wrong@example.com",
            "password": "correct",
            "full_name": "Wrong",
        })
        res = client.post("/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "incorrect",
        })
        assert res.status_code == 401

    def test_login_nonexistent_user(self, client):
        res = client.post("/api/auth/login", json={
            "email": "ghost@example.com",
            "password": "whatever",
        })
        assert res.status_code == 401


class TestRefreshToken:
    def test_refresh_success(self, client):
        reg = client.post("/api/auth/register", json={
            "email": "refresh@example.com",
            "password": "pass123",
            "full_name": "Refresh",
        })
        refresh_token = reg.json()["refresh_token"]
        res = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_refresh_invalid_token(self, client):
        res = client.post("/api/auth/refresh", json={"refresh_token": "invalid.token.here"})
        assert res.status_code == 401

    def test_refresh_with_access_token_fails(self, client):
        reg = client.post("/api/auth/register", json={
            "email": "badref@example.com",
            "password": "pass123",
            "full_name": "BadRef",
        })
        access_token = reg.json()["access_token"]
        res = client.post("/api/auth/refresh", json={"refresh_token": access_token})
        assert res.status_code == 401


class TestGetMe:
    def test_get_me_authenticated(self, auth_client):
        res = auth_client.get("/api/auth/me")
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == "testuser@example.com"
        assert data["full_name"] == "Test User"
        assert data["role"] == "client"
        assert data["subscription_plan"] == "free"

    def test_get_me_unauthenticated(self, client):
        res = client.get("/api/auth/me")
        assert res.status_code == 401

    def test_get_me_invalid_token(self, client):
        client.headers["Authorization"] = "Bearer invalid.token.value"
        res = client.get("/api/auth/me")
        assert res.status_code == 401


class TestUpdateMe:
    def test_update_name(self, auth_client):
        res = auth_client.put("/api/auth/me", json={"full_name": "Updated Name"})
        assert res.status_code == 200
        assert res.json()["full_name"] == "Updated Name"

    def test_update_avatar(self, auth_client):
        res = auth_client.put("/api/auth/me", json={"avatar_url": "https://example.com/avatar.png"})
        assert res.status_code == 200
        assert res.json()["avatar_url"] == "https://example.com/avatar.png"
