from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from meamen.db.session import get_session
from meamen.models.trainee import Trainee
from meamen.schemas.trainee import (
    TraineeCreate,
    TraineeRead,
    TraineeUpdate,
    MeasurementRecord,
    ProgressPhoto
)
from meamen.crud.trainee import (
    get_trainees,
    get_trainee_by_id,
    create_trainee,
    update_trainee,
    delete_trainee,
    add_measurement_record,
    add_progress_photo
)

router = APIRouter(prefix="/trainees", tags=["trainees"])


@router.get("/", response_model=List[TraineeRead])
async def read_trainees(
    trainer_id: int,
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_session),
):
    """Get all trainees for a specific trainer"""
    return await get_trainees(session, trainer_id, skip, limit)


@router.get("/{trainee_id}", response_model=TraineeRead)
async def read_trainee(
    trainee_id: int,
    trainer_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Get a specific trainee by ID"""
    trainee = await get_trainee_by_id(session, trainee_id, trainer_id)
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee not found"
        )
    return trainee



@router.post("/", response_model=TraineeRead, status_code=status.HTTP_201_CREATED)
async def add_trainee(
    trainee: TraineeCreate,
    trainer_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Create a new trainee"""
    db_trainee = Trainee(**trainee.model_dump(), trainer_id=trainer_id)
    return await create_trainee(session, db_trainee)


@router.put("/{trainee_id}", response_model=TraineeRead)
async def modify_trainee(
    trainee_id: int,
    trainer_id: int,
    trainee_update: TraineeUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update a trainee's information"""
    trainee = await update_trainee(session, trainee_id, trainer_id, trainee_update)
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee not found"
        )
    return trainee


@router.delete("/{trainee_id}")
async def remove_trainee(
    trainee_id: int,
    trainer_id: int,
    session: AsyncSession = Depends(get_session),
):
    """Delete a trainee"""
    success = await delete_trainee(session, trainee_id, trainer_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee not found"
        )
    return {"message": "Trainee deleted successfully"}


@router.post("/{trainee_id}/measurements", response_model=TraineeRead)
async def add_trainee_measurement(
    trainee_id: int,
    trainer_id: int,
    measurement: MeasurementRecord,
    session: AsyncSession = Depends(get_session),
):
    """Add a new measurement record for a trainee"""
    trainee = await add_measurement_record(
        session, trainee_id, trainer_id, measurement.model_dump()
    )
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee not found"
        )
    return trainee


@router.post("/{trainee_id}/photos", response_model=TraineeRead)
async def add_trainee_photo(
    trainee_id: int,
    trainer_id: int,
    photo: ProgressPhoto,
    session: AsyncSession = Depends(get_session),
):
    """Add a new progress photo for a trainee"""
    trainee = await add_progress_photo(
        session, trainee_id, trainer_id, photo.model_dump()
    )
    if not trainee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainee not found"
        )
    return trainee
