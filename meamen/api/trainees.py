from fastapi import APIRouter, Depends
from sqlmodel import Session
from typing import List
from meamen.db.session import get_session
from meamen.models.trainee import Trainee
from meamen.schemas.trainee import TraineeCreate, TraineeRead
from meamen.crud.trainee import get_trainees, create_trainee

router = APIRouter(prefix="/trainees", tags=["trainees"])


@router.get("/", response_model=List[TraineeRead])
async def read_trainees(
    trainer_id: int,
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
):
    return await get_trainees(session, trainer_id, skip, limit)


@router.post("/", response_model=TraineeRead)
async def add_trainee(
    trainee: TraineeCreate, trainer_id: int, session: Session = Depends(get_session)
):
    db_trainee = Trainee(**trainee.model_dump(), trainer_id=trainer_id)
    return await create_trainee(session, db_trainee)
