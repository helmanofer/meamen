from fastapi.testclient import TestClient
from meamen.main import app
import uuid

client = TestClient(app)


def test_register_and_login():
    email = f"user_{uuid.uuid4()}@test.com"
    password = "testpassword"
    # Register
    response = client.post(
        "/auth/register", json={"email": email, "password": password}
    )
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["email"] == email
    # Login
    response = client.post(
        "/auth/jwt/login", data={"username": email, "password": password}
    )
    assert response.status_code == 200, response.text
    assert "access_token" in response.json()
