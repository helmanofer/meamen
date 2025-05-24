from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
from meamen.db.session import get_session
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
    skip: int = 0, limit: int = 100, session: AsyncSession = Depends(get_session)
):
    return await get_trainers(session, skip, limit)


@router.post("/", response_model=TrainerRead)
async def add_trainer(trainer: TrainerCreate, session: AsyncSession = Depends(get_session)):
    db_trainer = Trainer(**trainer.model_dump())
    return await create_trainer(session, db_trainer)


@router.get("/{trainer_id}", response_model=TrainerRead)
async def get_trainer(trainer_id: int, session: AsyncSession = Depends(get_session)):
    trainer = await get_trainer_by_id(session, trainer_id)
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return trainer


@router.put("/{trainer_id}", response_model=TrainerRead)
async def update_trainer_endpoint(
    trainer_id: int, trainer: TrainerCreate, session: AsyncSession = Depends(get_session)
):
    updated = await update_trainer(session, trainer_id, trainer.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return updated


@router.delete("/{trainer_id}")
async def delete_trainer_endpoint(
    trainer_id: int, session: AsyncSession = Depends(get_session)
):
    deleted = await delete_trainer(session, trainer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return {"ok": True}


@router.get("/{trainer_id}/dashboard")
async def trainer_dashboard(trainer_id: int, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    statement = select(Trainee).where(Trainee.trainer_id == trainer_id)
    result = await session.execute(statement)
    trainees = result.scalars().all()
    return {
        "trainer_id": trainer_id,
        "trainee_count": len(trainees),
        # Placeholders for future dashboard data:
        "upcoming_sessions": [],
        "recent_activity": [],
    }
