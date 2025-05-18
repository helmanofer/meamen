from fastapi.testclient import TestClient
from meamen.main import app
import uuid

client = TestClient(app)


def get_auth_token():
    email = f"trainee_{uuid.uuid4()}@test.com"
    password = "testpassword"
    # Register
    client.post("/auth/register", json={"email": email, "password": password})
    # Login
    response = client.post(
        "/auth/jwt/login", data={"username": email, "password": password}
    )
    assert response.status_code == 200
    return response.json()["access_token"], email


def test_create_and_list_trainees():
    token, email = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    # Create trainee
    trainee_data = {
        "name": "Test Trainee",
        "gender": "Other",
        "date_of_birth": "2000-01-01",
        "email": "trainee1@test.com",
        "phone": "1234567890",
        "address": "123 Test St",
    }
    # Use user as their own trainer for test
    response = client.post(
        "/trainees/?trainer_id=1", json=trainee_data, headers=headers
    )
    assert response.status_code == 200 or response.status_code == 201
    # List trainees
    response = client.get("/trainees/?trainer_id=1", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
