from fastapi.testclient import TestClient
from meamen.main import app

client = TestClient(app)


def test_create_and_get_exercise():
    # Create
    payload = {
        "name": "Push Up",
        "description": "A basic push up exercise.",
        "category": "Strength",
        "muscle_groups": "Chest,Triceps",
        "difficulty": "Beginner",
        "equipment": None,
        "image_url": None,
        "video_url": None,
        "instructions": "Keep your back straight...",
        "tips": "Don't flare elbows.",
    }
    response = client.post("/exercises/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Push Up"
    exercise_id = data["id"]

    # Get
    response = client.get(f"/exercises/{exercise_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Push Up"


def test_list_exercises():
    response = client.get("/exercises/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_update_and_delete_exercise():
    # Create
    payload = {
        "name": "Squat",
        "description": "A basic squat exercise.",
        "category": "Strength",
        "muscle_groups": "Legs,Glutes",
        "difficulty": "Beginner",
        "equipment": None,
        "image_url": None,
        "video_url": None,
        "instructions": "Keep your back straight...",
        "tips": "Don't let knees go over toes.",
    }
    response = client.post("/exercises/", json=payload)
    assert response.status_code == 201
    exercise_id = response.json()["id"]

    # Update
    update_payload = payload.copy()
    update_payload["name"] = "Bodyweight Squat"
    response = client.put(f"/exercises/{exercise_id}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["name"] == "Bodyweight Squat"

    # Delete
    response = client.delete(f"/exercises/{exercise_id}")
    assert response.status_code == 204
    # Confirm deletion
    response = client.get(f"/exercises/{exercise_id}")
    assert response.status_code == 404
