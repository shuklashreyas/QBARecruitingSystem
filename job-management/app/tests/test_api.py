# tests/test_api.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_home():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Job Management API is running"}


def test_token_generation():
    # Using the fake user from the main.py for testing
    response = client.post(
        "/token",
        data={"username": "admin", "password": "admin123"}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert "access_token" in json_data
    assert json_data["token_type"] == "bearer"


def test_get_jobs():
    # First, get an access token
    token_resp = client.post(
        "/token",
        data={"username": "admin", "password": "admin123"}
    )
    token = token_resp.json()["access_token"]

    # Then, test the GET /jobs endpoint
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/jobs", headers=headers)
    # Depending on your database state, adjust the assertion
    assert response.status_code == 200
    # Assert that the response is a list (even if empty)
    assert isinstance(response.json(), list)
