"""Tests for content management endpoints."""
import pytest


@pytest.fixture
def business_id(auth_client, sample_business):
    """Create a business and return its ID."""
    res = auth_client.post("/api/business/", json=sample_business)
    return res.json()["id"]


class TestContent:
    def test_create_content(self, auth_client, business_id):
        res = auth_client.post("/api/content/", json={
            "business_id": business_id,
            "prompt_type": "gbp_category_audit",
            "week_number": 1,
            "content": {"generated_text": "Test audit content"},
        })
        assert res.status_code == 201
        assert res.json()["prompt_type"] == "gbp_category_audit"

    def test_get_content(self, auth_client, business_id):
        create = auth_client.post("/api/content/", json={
            "business_id": business_id,
            "prompt_type": "services_optimization",
            "content": {"generated_text": "Service content"},
        })
        content_id = create.json()["id"]
        res = auth_client.get(f"/api/content/{content_id}")
        assert res.status_code == 200
        assert res.json()["content"]["generated_text"] == "Service content"

    def test_get_content_not_found(self, auth_client):
        res = auth_client.get("/api/content/9999")
        assert res.status_code == 404

    def test_get_business_content(self, auth_client, business_id):
        auth_client.post("/api/content/", json={
            "business_id": business_id,
            "prompt_type": "gbp_category_audit",
            "content": {"generated_text": "Audit 1"},
        })
        auth_client.post("/api/content/", json={
            "business_id": business_id,
            "prompt_type": "services_optimization",
            "content": {"generated_text": "Service 1"},
        })
        res = auth_client.get(f"/api/content/business/{business_id}")
        assert res.status_code == 200
        assert len(res.json()) == 2

    def test_get_business_content_filtered(self, auth_client, business_id):
        auth_client.post("/api/content/", json={
            "business_id": business_id,
            "prompt_type": "gbp_category_audit",
            "content": {"generated_text": "Audit"},
        })
        auth_client.post("/api/content/", json={
            "business_id": business_id,
            "prompt_type": "services_optimization",
            "content": {"generated_text": "Service"},
        })
        res = auth_client.get(f"/api/content/business/{business_id}", params={"prompt_type": "gbp_category_audit"})
        assert len(res.json()) == 1

    def test_update_content(self, auth_client, business_id):
        create = auth_client.post("/api/content/", json={
            "business_id": business_id,
            "prompt_type": "photo_strategy",
            "content": {"generated_text": "Original"},
        })
        content_id = create.json()["id"]
        res = auth_client.put(f"/api/content/{content_id}", json={
            "notes": "Updated notes",
        })
        assert res.status_code == 200
        assert res.json()["notes"] == "Updated notes"

    def test_delete_content(self, auth_client, business_id):
        create = auth_client.post("/api/content/", json={
            "business_id": business_id,
            "prompt_type": "posts_calendar",
            "content": {"generated_text": "Calendar"},
        })
        content_id = create.json()["id"]
        res = auth_client.delete(f"/api/content/{content_id}")
        assert res.status_code == 204
        get_res = auth_client.get(f"/api/content/{content_id}")
        assert get_res.status_code == 404

    def test_content_unauthenticated(self, client):
        res = client.get("/api/content/1")
        assert res.status_code == 401
