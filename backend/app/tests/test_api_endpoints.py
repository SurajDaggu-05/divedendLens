from fastapi.testclient import TestClient
from app.main import app
from app.db.session import engine, Base, SessionLocal
from app.db.seed import seed_database

client = TestClient(app)


def setup_module():
    Base.metadata.create_all(bind=engine)
    seed_database()


def test_health_endpoint():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["data"]["status"] == "healthy"


def test_auth_me_endpoint():
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "arjun@example.com", "password": "SecurePassword123!"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]

    res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["data"]["email"] == "arjun@example.com"


def test_dashboard_overview_endpoint():
    res = client.get("/api/v1/dashboard/overview")
    assert res.status_code == 200
    data = res.json()["data"]
    assert "metrics" in data
    assert "upcoming_events" in data
    assert data["metrics"]["currency"] == "INR"


def test_list_portfolios_and_summary():
    res = client.get("/api/v1/portfolios")
    assert res.status_code == 200
    portfolios = res.json()["data"]
    assert len(portfolios) >= 1
    
    p_id = portfolios[0]["id"]
    summary_res = client.get(f"/api/v1/portfolios/{p_id}/summary")
    assert summary_res.status_code == 200
    assert summary_res.json()["data"]["currency"] == "INR"


def test_list_dividends_and_detail():
    res = client.get("/api/v1/dividends")
    assert res.status_code == 200
    events = res.json()["data"]
    assert len(events) >= 3

    event_id = events[0]["id"]
    detail_res = client.get(f"/api/v1/dividends/{event_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["data"]["id"] == event_id


def test_calendar_endpoint():
    res = client.get("/api/v1/calendar")
    assert res.status_code == 200
    events = res.json()["data"]
    assert len(events) >= 1


def test_agents_and_alerts_endpoints():
    agents_res = client.get("/api/v1/agents")
    assert agents_res.status_code == 200
    assert len(agents_res.json()["data"]) >= 4

    alerts_res = client.get("/api/v1/alerts")
    assert alerts_res.status_code == 200
    assert len(alerts_res.json()["data"]) >= 1
