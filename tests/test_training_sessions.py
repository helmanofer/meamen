import pytest
from fastapi.testclient import TestClient
from meamen.main import app

client = TestClient(app)


@pytest.fixture(scope="module")
def session_data():
    return {
        "trainee_id": 1,
        "trainer_id": 1,
        "name": "Morning Workout",
        "description": "A basic morning session",
        "scheduled_time": "2024-07-01T08:00:00",
    }


def test_create_training_session(session_data):
    response = client.post("/training-sessions/", json=session_data)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] > 0
    assert data["name"] == session_data["name"]
    global created_id
    created_id = data["id"]


def test_get_training_session():
    response = client.get(f"/training-sessions/{created_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == created_id


def test_list_training_sessions():
    response = client.get("/training-sessions/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_update_training_session():
    update = {"name": "Updated Workout"}
    response = client.put(f"/training-sessions/{created_id}", json=update)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Workout"


def test_delete_training_session():
    response = client.delete(f"/training-sessions/{created_id}")
    assert response.status_code == 204
    # Confirm deletion
    response = client.get(f"/training-sessions/{created_id}")
    assert response.status_code == 404
