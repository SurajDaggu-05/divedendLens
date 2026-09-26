from fastapi.testclient import TestClient
from app.main import app
from app.db.session import engine, Base
from app.db.seed import seed_database
from app.api.auth import FAILED_ATTEMPTS

client = TestClient(app)


def setup_module():
    Base.metadata.create_all(bind=engine)
    seed_database()
    FAILED_ATTEMPTS.clear()


def test_demo_account_valid_password():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "arjun@example.com", "password": "SecurePassword123!"},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["user"]["email"] == "arjun@example.com"
    assert data["user"]["name"] == "Arjun Sharma"
    assert "access_token" in data


def test_demo_account_wrong_password_rejected():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "arjun@example.com", "password": "wrongpassword123"},
    )
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


def test_suraj_account_valid_credentials():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "surajdaggu40@gmail.com", "password": "suraj40"},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["user"]["email"] == "surajdaggu40@gmail.com"
    assert data["user"]["name"] == "Suraj"


def test_suraj_account_wrong_password_rejected():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "surajdaggu40@gmail.com", "password": "parvath06"},
    )
    assert res.status_code == 401


def test_parvath_account_valid_credentials():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "parvath06@gmail.com", "password": "parvath06"},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["user"]["email"] == "parvath06@gmail.com"
    assert data["user"]["name"] == "Parvath"


def test_parvath_account_wrong_password_rejected():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "parvath06@gmail.com", "password": "suraj40"},
    )
    assert res.status_code == 401


def test_sushanth_account_valid_credentials():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "sushanth05@gmail.com", "password": "sushanth05"},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["user"]["email"] == "sushanth05@gmail.com"
    assert data["user"]["name"] == "Sushanth"


def test_sushanth_account_wrong_password_rejected():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "sushanth05@gmail.com", "password": "kiran23"},
    )
    assert res.status_code == 401


def test_kiran_account_valid_credentials_with_whitespace_and_case():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": " kiran23@gmail.com", "password": "kiran23"},
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["user"]["email"] == "kiran23@gmail.com"
    assert data["user"]["name"] == "Kiran"


def test_kiran_account_wrong_password_rejected():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "kiran23@gmail.com", "password": "randompassword"},
    )
    assert res.status_code == 401


def test_unknown_email_rejected():
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent_user_999@example.com", "password": "SomePassword123!"},
    )
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


def test_new_user_registration_and_login_flow():
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Rahul Kumar",
            "email": "rahul.kumar@example.com",
            "password": "StrongPassword123!",
        },
    )
    assert reg_res.status_code == 201
    reg_data = reg_res.json()["data"]
    assert reg_data["user"]["name"] == "Rahul Kumar"
    assert reg_data["user"]["email"] == "rahul.kumar@example.com"

    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "RAHUL.KUMAR@example.com",
            "password": "StrongPassword123!",
        },
    )
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]

    wrong_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": "rahul.kumar@example.com",
            "password": "WrongPassword123!",
        },
    )
    assert wrong_res.status_code == 401

    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["data"]["name"] == "Rahul Kumar"


def test_duplicate_email_registration_rejected():
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Duplicate User",
            "email": "surajdaggu40@gmail.com",
            "password": "SecurePassword123!",
        },
    )
    assert res.status_code == 409
    assert "already exists" in res.json()["detail"]


def test_rate_limiting_after_multiple_failed_attempts():
    email = "test.lockout@example.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "name": "Lockout Test User",
            "email": email,
            "password": "ValidPassword123!",
        },
    )

    for _ in range(5):
        client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": "WrongPassword!"},
        )

    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "ValidPassword123!"},
    )
    assert res.status_code == 429
    assert "Too many unsuccessful attempts" in res.json()["detail"]
