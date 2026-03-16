"""Tests for prompt types and progress tracking endpoints."""
import pytest


@pytest.fixture
def business_id(auth_client, sample_business):
    res = auth_client.post("/api/business/", json=sample_business)
    return res.json()["id"]


class TestPromptTypes:
    def test_get_prompt_types(self, auth_client):
        res = auth_client.get("/api/prompts/types")
        assert res.status_code == 200
        types = res.json()["prompt_types"]
        assert len(types) == 8
        ids = [t["id"] for t in types]
        assert "gbp_category_audit" in ids
        assert "photo_strategy" in ids

    def test_prompt_types_have_required_fields(self, auth_client):
        res = auth_client.get("/api/prompts/types")
        for pt in res.json()["prompt_types"]:
            assert "id" in pt
            assert "name" in pt
            assert "description" in pt
            assert "week" in pt
            assert "prompt_number" in pt


class TestProgress:
    def test_get_progress_empty(self, auth_client, business_id):
        res = auth_client.get(f"/api/prompts/progress/{business_id}")
        assert res.status_code == 200
        assert res.json() == []

    def test_get_progress_nonexistent_business(self, auth_client):
        res = auth_client.get("/api/prompts/progress/9999")
        assert res.status_code == 404

    def test_progress_unauthenticated(self, client):
        res = client.get("/api/prompts/progress/1")
        assert res.status_code == 401


class TestExecutePrompt:
    def test_execute_invalid_prompt_type(self, auth_client, business_id):
        res = auth_client.post("/api/prompts/execute", json={
            "business_id": business_id,
            "prompt_type": "nonexistent_prompt",
        })
        # Should fail with 400 or 500 due to invalid prompt type
        assert res.status_code in [400, 500]

    def test_execute_nonexistent_business(self, auth_client):
        res = auth_client.post("/api/prompts/execute", json={
            "business_id": 9999,
            "prompt_type": "gbp_category_audit",
        })
        assert res.status_code == 404

    def test_execute_unauthenticated(self, client):
        res = client.post("/api/prompts/execute", json={
            "business_id": 1,
            "prompt_type": "gbp_category_audit",
        })
        assert res.status_code == 401

    def test_stream_unauthenticated(self, client):
        res = client.post("/api/prompts/execute/stream", json={
            "business_id": 1,
            "prompt_type": "gbp_category_audit",
        })
        assert res.status_code == 401

    def test_stream_nonexistent_business(self, auth_client):
        res = auth_client.post("/api/prompts/execute/stream", json={
            "business_id": 9999,
            "prompt_type": "gbp_category_audit",
        })
        assert res.status_code == 404
