from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Any
from meamen.models.trainer import Trainer
from meamen.models.trainee import Trainee
from meamen.schemas.trainer import TrainerCreate, TrainerRead
from meamen.crud.trainer import (
    get_trainers,
    create_trainer,
    get_trainer_by_id,
    update_trainer,
    delete_trainer,
)

router = APIRouter(prefix="/trainers", tags=["trainers"])


@router.get("/", response_model=List[TrainerRead])
async def read_trainers(
    skip: int = 0, limit: int = 100, data_store: List[Trainer] = Depends(lambda: [])
):
    return get_trainers(data_store, skip, limit)


@router.post("/", response_model=TrainerRead, status_code=status.HTTP_201_CREATED)
async def add_trainer(trainer: TrainerCreate, data_store: List[Trainer] = Depends(lambda: [])):
    db_trainer = Trainer(**trainer.model_dump())
    return create_trainer(data_store, db_trainer)


@router.get("/{trainer_id}", response_model=TrainerRead)
async def get_trainer(trainer_id: int, data_store: List[Trainer] = Depends(lambda: [])):
    trainer = get_trainer_by_id(data_store, trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return trainer


@router.put("/{trainer_id}", response_model=TrainerRead)
async def update_trainer_endpoint(
    trainer_id: int, trainer: TrainerCreate, data_store: List[Trainer] = Depends(lambda: [])
):
    updated = update_trainer(data_store, trainer_id, trainer.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return updated


@router.delete("/{trainer_id}")
async def delete_trainer_endpoint(
    trainer_id: int, data_store: List[Trainer] = Depends(lambda: [])
):
    deleted = delete_trainer(data_store, trainer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return {"ok": True}


@router.get("/{trainer_id}/dashboard")
async def trainer_dashboard(trainer_id: int, data_store: List[Trainee] = Depends(lambda: [])) -> dict[str, Any]:
    trainees = [trainee for trainee in data_store if trainee.trainer_id == trainer_id]
    return {
        "trainer_id": trainer_id,
        "trainee_count": len(trainees),
        # Placeholders for future dashboard data:
        "upcoming_sessions": [],
        "recent_activity": [],
    }
