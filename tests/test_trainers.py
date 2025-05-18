import pytest
import asyncio
from sqlmodel import SQLModel
from meamen.db.session import engine
from datetime import date
from fastapi.testclient import TestClient
from meamen.main import app
from meamen.models.trainer import Trainer
from meamen.models.trainee import Trainee
from meamen.db.session import AsyncSessionLocal


async def create_all():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


@pytest.fixture(scope="session", autouse=True)
def create_test_tables():
    asyncio.run(create_all())


client = TestClient(app)


@pytest.mark.asyncio
async def test_trainer_dashboard():
    # Setup: create a trainer and some trainees
    async with AsyncSessionLocal() as session:
        trainer = Trainer(name="Test Trainer", email="trainer@example.com")
        session.add(trainer)
        await session.commit()
        await session.refresh(trainer)
        # Add 3 trainees for this trainer
        trainees = [
            Trainee(
                name=f"Trainee {i}",
                gender="M",
                date_of_birth=date(2000, 1, 1),
                email=f"t{i}@ex.com",
                trainer_id=trainer.id,
            )
            for i in range(3)
        ]
        session.add_all(trainees)
        await session.commit()
    # Test the dashboard endpoint
    response = client.get(f"/trainers/{trainer.id}/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["trainer_id"] == trainer.id
    assert data["trainee_count"] == 3
    assert "upcoming_sessions" in data
    assert "recent_activity" in data
