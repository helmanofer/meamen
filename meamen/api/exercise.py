from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List
from meamen.db.session import get_session
from meamen.models.exercise import Exercise
from meamen.schemas.exercise import ExerciseCreate, ExerciseRead
from meamen.crud import exercise as crud_exercise

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("/", response_model=List[ExerciseRead])
async def list_exercises(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_session),
):
    return await crud_exercise.get_exercises(session, skip=skip, limit=limit)


@router.get("/{exercise_id}", response_model=ExerciseRead)
async def get_exercise(
    exercise_id: int,
    session: AsyncSession = Depends(get_session),
):
    db_exercise = await crud_exercise.get_exercise_by_id(session, exercise_id)
    if not db_exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return db_exercise


@router.post("/", response_model=ExerciseRead, status_code=status.HTTP_201_CREATED)
async def create_exercise(
    exercise_in: ExerciseCreate,
    session: AsyncSession = Depends(get_session),
):
    db_exercise = Exercise.model_validate(exercise_in)
    return await crud_exercise.create_exercise(session, db_exercise)


@router.put("/{exercise_id}", response_model=ExerciseRead)
async def update_exercise(
    exercise_id: int,
    exercise_in: ExerciseCreate,
    session: AsyncSession = Depends(get_session),
):
    updated = await crud_exercise.update_exercise(
        session, exercise_id, exercise_in.model_dump(exclude_unset=True)
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return updated


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(
    exercise_id: int,
    session: AsyncSession = Depends(get_session),
):
    deleted = await crud_exercise.delete_exercise(session, exercise_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Exercise not found")
