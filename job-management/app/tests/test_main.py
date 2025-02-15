from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_home():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Job Management API is running"}

def test_create_job():
    response = client.post("/jobs", json={"title": "Tester", "description": "Test software", "company": "QA Inc"})
    assert response.status_code == 200
    assert response.json()["title"] == "Tester"
