"""Tests for analytics and health endpoints."""
import pytest


class TestHealth:
    def test_health_check(self, client):
        res = client.get("/health")
        assert res.status_code == 200
        assert res.json() == {"status": "healthy"}

    def test_root_endpoint(self, client):
        res = client.get("/")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "running"
        assert "version" in data


class TestDashboardAnalytics:
    def test_analytics_empty(self, auth_client):
        res = auth_client.get("/api/analytics/dashboard")
        assert res.status_code == 200
        data = res.json()
        assert data["total_businesses"] == 0
        assert data["total_content_generated"] == 0
        assert data["completion_rate"] == 0
        assert data["recent_activity"] == []

    def test_analytics_with_data(self, auth_client, sample_business):
        # Create a business
        biz = auth_client.post("/api/business/", json=sample_business).json()
        # Create some content
        auth_client.post("/api/content/", json={
            "business_id": biz["id"],
            "prompt_type": "gbp_category_audit",
            "content": {"generated_text": "Audit result"},
        })
        res = auth_client.get("/api/analytics/dashboard")
        data = res.json()
        assert data["total_businesses"] == 1
        assert data["total_content_generated"] == 1
        assert len(data["recent_activity"]) == 1
        assert data["recent_activity"][0]["business_name"] == "Test Coffee Shop"

    def test_analytics_unauthenticated(self, client):
        res = client.get("/api/analytics/dashboard")
        assert res.status_code == 401
