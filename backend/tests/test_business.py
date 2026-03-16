"""Tests for business CRUD endpoints and multi-tenancy."""
import pytest


class TestCreateBusiness:
    def test_create_business(self, auth_client, sample_business):
        res = auth_client.post("/api/business/", json=sample_business)
        assert res.status_code == 201
        data = res.json()
        assert data["name"] == "Test Coffee Shop"
        assert data["location"] == "Austin, TX"
        assert data["user_id"] is not None
        assert len(data["service_areas"]) == 2
        assert len(data["competitors"]) == 1

    def test_create_business_minimal(self, auth_client):
        res = auth_client.post("/api/business/", json={"name": "Minimal Biz"})
        assert res.status_code == 201
        assert res.json()["name"] == "Minimal Biz"

    def test_create_business_unauthenticated(self, client, sample_business):
        res = client.post("/api/business/", json=sample_business)
        assert res.status_code == 401

    def test_create_business_missing_name(self, auth_client):
        res = auth_client.post("/api/business/", json={"website": "https://example.com"})
        assert res.status_code == 422


class TestListBusinesses:
    def test_list_empty(self, auth_client):
        res = auth_client.get("/api/business/")
        assert res.status_code == 200
        assert res.json() == []

    def test_list_own_businesses(self, auth_client, sample_business):
        auth_client.post("/api/business/", json=sample_business)
        auth_client.post("/api/business/", json={"name": "Second Biz"})
        res = auth_client.get("/api/business/")
        assert len(res.json()) == 2

    def test_list_with_search(self, auth_client, sample_business):
        auth_client.post("/api/business/", json=sample_business)
        auth_client.post("/api/business/", json={"name": "Taco Stand"})
        res = auth_client.get("/api/business/", params={"search": "coffee"})
        assert len(res.json()) == 1
        assert res.json()[0]["name"] == "Test Coffee Shop"

    def test_list_unauthenticated(self, client):
        res = client.get("/api/business/")
        assert res.status_code == 401


class TestGetBusiness:
    def test_get_business(self, auth_client, sample_business):
        create_res = auth_client.post("/api/business/", json=sample_business)
        biz_id = create_res.json()["id"]
        res = auth_client.get(f"/api/business/{biz_id}")
        assert res.status_code == 200
        assert res.json()["name"] == "Test Coffee Shop"

    def test_get_nonexistent(self, auth_client):
        res = auth_client.get("/api/business/9999")
        assert res.status_code == 404


class TestUpdateBusiness:
    def test_update_business(self, auth_client, sample_business):
        create_res = auth_client.post("/api/business/", json=sample_business)
        biz_id = create_res.json()["id"]
        res = auth_client.put(f"/api/business/{biz_id}", json={"name": "Updated Name"})
        assert res.status_code == 200
        assert res.json()["name"] == "Updated Name"
        assert res.json()["location"] == "Austin, TX"  # Unchanged

    def test_update_nonexistent(self, auth_client):
        res = auth_client.put("/api/business/9999", json={"name": "Ghost"})
        assert res.status_code == 404


class TestDeleteBusiness:
    def test_delete_business(self, auth_client, sample_business):
        create_res = auth_client.post("/api/business/", json=sample_business)
        biz_id = create_res.json()["id"]
        res = auth_client.delete(f"/api/business/{biz_id}")
        assert res.status_code == 204
        # Verify deleted
        get_res = auth_client.get(f"/api/business/{biz_id}")
        assert get_res.status_code == 404

    def test_delete_nonexistent(self, auth_client):
        res = auth_client.delete("/api/business/9999")
        assert res.status_code == 404


class TestMultiTenancy:
    def test_user_cannot_see_other_users_businesses(self, auth_client, second_auth_client, sample_business):
        # User 1 creates a business
        auth_client.post("/api/business/", json=sample_business)
        # User 2 should see empty list
        res = second_auth_client.get("/api/business/")
        assert res.json() == []

    def test_user_cannot_access_other_users_business(self, auth_client, second_auth_client, sample_business):
        create_res = auth_client.post("/api/business/", json=sample_business)
        biz_id = create_res.json()["id"]
        res = second_auth_client.get(f"/api/business/{biz_id}")
        assert res.status_code == 403

    def test_user_cannot_update_other_users_business(self, auth_client, second_auth_client, sample_business):
        create_res = auth_client.post("/api/business/", json=sample_business)
        biz_id = create_res.json()["id"]
        res = second_auth_client.put(f"/api/business/{biz_id}", json={"name": "Hijacked"})
        assert res.status_code == 403

    def test_user_cannot_delete_other_users_business(self, auth_client, second_auth_client, sample_business):
        create_res = auth_client.post("/api/business/", json=sample_business)
        biz_id = create_res.json()["id"]
        res = second_auth_client.delete(f"/api/business/{biz_id}")
        assert res.status_code == 403
