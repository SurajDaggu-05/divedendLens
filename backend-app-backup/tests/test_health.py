from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert "data" in json_data
    assert json_data["data"]["status"] == "healthy"
    assert json_data["data"]["version"] == "1.0.0"
    assert "services" in json_data["data"]
    assert json_data["data"]["services"]["database"] == "connected"
    assert json_data["data"]["services"]["redis"] == "connected"
    assert "timestamp" in json_data["data"]


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["name"] == "DividendLens API"
    assert json_data["health"] == "/api/v1/health"
