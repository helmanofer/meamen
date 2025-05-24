from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from meamen.db.session import get_session
from meamen.models.exercise import Exercise
from meamen.schemas.exercise import ExerciseCreate, ExerciseRead
from meamen.crud import exercise as crud_exercise

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("/", response_model=List[ExerciseRead])
def list_exercises(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
):
    return crud_exercise.get_exercises(session, skip=skip, limit=limit)


@router.get("/{exercise_id}", response_model=ExerciseRead)
def get_exercise(
    exercise_id: int,
    session: Session = Depends(get_session),
):
    db_exercise = crud_exercise.get_exercise_by_id(session, exercise_id)
    if not db_exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return db_exercise


@router.post("/", response_model=ExerciseRead, status_code=status.HTTP_201_CREATED)
def create_exercise(
    exercise_in: ExerciseCreate,
    session: Session = Depends(get_session),
):
    db_exercise = Exercise.model_validate(exercise_in)
    return crud_exercise.create_exercise(session, db_exercise)


@router.put("/{exercise_id}", response_model=ExerciseRead)
def update_exercise(
    exercise_id: int,
    exercise_in: ExerciseCreate,
    session: Session = Depends(get_session),
):
    updated = crud_exercise.update_exercise(
        session, exercise_id, exercise_in.model_dump(exclude_unset=True)
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return updated


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(
    exercise_id: int,
    session: Session = Depends(get_session),
):
    deleted = crud_exercise.delete_exercise(session, exercise_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Exercise not found")
