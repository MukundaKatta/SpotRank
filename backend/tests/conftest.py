"""Shared test fixtures for the SpotRank backend test suite."""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Force test database before importing app
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["SECRET_KEY"] = "test-secret-key"

from app.database import Base, get_db
from app.main import app

TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """Unauthenticated test client."""
    return TestClient(app)


@pytest.fixture
def auth_client(client):
    """Authenticated test client with a registered user."""
    # Register a user
    res = client.post("/api/auth/register", json={
        "email": "testuser@example.com",
        "password": "password123",
        "full_name": "Test User",
    })
    token = res.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client


@pytest.fixture
def second_auth_client(client):
    """A second authenticated user for multi-tenancy tests."""
    client2 = TestClient(app)
    res = client2.post("/api/auth/register", json={
        "email": "other@example.com",
        "password": "password123",
        "full_name": "Other User",
    })
    token = res.json()["access_token"]
    client2.headers["Authorization"] = f"Bearer {token}"
    return client2


@pytest.fixture
def sample_business():
    """Sample business data for tests."""
    return {
        "name": "Test Coffee Shop",
        "website": "https://testcoffee.com",
        "location": "Austin, TX",
        "address": "123 Main St, Austin, TX 78701",
        "phone": "+1-555-123-4567",
        "gbp_url": "https://business.google.com/test",
        "service_areas": ["Downtown Austin", "South Austin"],
        "target_keywords": ["best coffee austin", "coffee shop near me"],
        "competitors": [{"name": "Rival Coffee", "gbp_url": "https://business.google.com/rival"}],
        "core_services": ["Espresso", "Cold Brew", "Pastries"],
        "unique_selling_points": "Locally roasted beans, dog-friendly patio",
        "current_gbp_category": "Coffee Shop",
        "current_secondary_categories": ["Cafe", "Bakery"],
    }
