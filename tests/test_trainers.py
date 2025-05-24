from fastapi.testclient import TestClient
from meamen.main import app
from typing import Any

client = TestClient(app)

def create_trainer(name: str, email: str) -> dict[str, Any]:
    response = client.post("/trainers/", json={"name": name, "email": email})
    assert response.status_code == 201, response.text
    return response.json()

def create_trainee(
    name: str,
    gender: str,
    date_of_birth: str,
    email: str,
    trainer_id: int
) -> dict[str, Any]:
    response = client.post(
        "/trainees/",
        params={"trainer_id": trainer_id},
        json={
            "name": name,
            "gender": gender,
            "date_of_birth": date_of_birth,
            "email": email
        }
    )
    assert response.status_code == 201, response.text
    return response.json()

def test_trainer_dashboard():
    # Setup: create a trainer and some trainees via API
    trainer = create_trainer("Test Trainer", "trainer@example.com")
    trainer_id = trainer["id"]
    for i in range(3):
        create_trainee(
            name=f"Trainee {i}",
            gender="M",
            date_of_birth="2000-01-01",
            email=f"t{i}@ex.com",
            trainer_id=trainer_id
        )
    # Test the dashboard endpoint
    response = client.get(f"/trainers/{trainer_id}/dashboard")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["trainer_id"] == trainer_id
    assert data["trainee_count"] == 3
    assert "upcoming_sessions" in data
    assert "recent_activity" in data
