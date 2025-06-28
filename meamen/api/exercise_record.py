from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from meamen.db.session import get_session
from meamen.crud import exercise_record as crud_exercise_record
from meamen.schemas.exercise_record import (
    ExerciseRecordCreate,
    ExerciseRecordRead,
    ExerciseRecordUpdate,
    SetRecordRequest,
    BulkSetRecordRequest
)

router = APIRouter(prefix="/api/exercise-records", tags=["exercise-records"])


@router.post("/", response_model=ExerciseRecordRead)
def create_exercise_record(
    exercise_record: ExerciseRecordCreate,
    session: Session = Depends(get_session)
):
    """Create a new exercise record"""
    return crud_exercise_record.create_exercise_record(session, exercise_record)


@router.get("/{exercise_record_id}", response_model=ExerciseRecordRead)
def get_exercise_record(
    exercise_record_id: str,
    session: Session = Depends(get_session)
):
    """Get exercise record by ID"""
    exercise_record = crud_exercise_record.get_exercise_record(session, exercise_record_id)
    if not exercise_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise record not found"
        )
    return exercise_record


@router.get("/session/{session_record_id}", response_model=List[ExerciseRecordRead])
def get_exercise_records_by_session(
    session_record_id: str,
    session: Session = Depends(get_session)
):
    """Get all exercise records for a training session"""
    return crud_exercise_record.get_exercise_records_by_session(session, session_record_id)


@router.get("/session/{session_record_id}/trainee/{trainee_id}", response_model=List[ExerciseRecordRead])
def get_exercise_records_by_trainee_and_session(
    session_record_id: str,
    trainee_id: str,
    session: Session = Depends(get_session)
):
    """Get exercise records for a specific trainee in a session"""
    return crud_exercise_record.get_exercise_records_by_trainee_and_session(
        session, trainee_id, session_record_id
    )


@router.patch("/{exercise_record_id}", response_model=ExerciseRecordRead)
def update_exercise_record(
    exercise_record_id: str,
    exercise_record_update: ExerciseRecordUpdate,
    session: Session = Depends(get_session)
):
    """Update exercise record (form rating, RPE, notes, status)"""
    exercise_record = crud_exercise_record.update_exercise_record(
        session, exercise_record_id, exercise_record_update
    )
    if not exercise_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise record not found"
        )
    return exercise_record


@router.patch("/{exercise_record_id}/sets", response_model=ExerciseRecordRead)
def record_set(
    exercise_record_id: str,
    set_record: SetRecordRequest,
    session: Session = Depends(get_session)
):
    """Record a single set for an exercise"""
    exercise_record = crud_exercise_record.record_set(session, exercise_record_id, set_record)
    if not exercise_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise record not found"
        )
    return exercise_record


@router.patch("/{exercise_record_id}/sets/bulk", response_model=ExerciseRecordRead)
def record_bulk_sets(
    exercise_record_id: str,
    bulk_sets: BulkSetRecordRequest,
    session: Session = Depends(get_session)
):
    """Record multiple sets at once"""
    exercise_record = crud_exercise_record.record_bulk_sets(
        session, exercise_record_id, bulk_sets.sets
    )
    if not exercise_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise record not found"
        )
    return exercise_record


@router.patch("/{exercise_record_id}/complete", response_model=ExerciseRecordRead)
def mark_exercise_complete(
    exercise_record_id: str,
    session: Session = Depends(get_session)
):
    """Mark an exercise as completed"""
    exercise_record = crud_exercise_record.mark_exercise_complete(session, exercise_record_id)
    if not exercise_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise record not found"
        )
    return exercise_record


@router.patch("/{exercise_record_id}/skip", response_model=ExerciseRecordRead)
def mark_exercise_skipped(
    exercise_record_id: str,
    session: Session = Depends(get_session)
):
    """Mark an exercise as skipped"""
    exercise_record = crud_exercise_record.mark_exercise_skipped(session, exercise_record_id)
    if not exercise_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise record not found"
        )
    return exercise_record


@router.get("/trainee/{trainee_id}/exercise/{exercise_id}/history", response_model=List[ExerciseRecordRead])
def get_previous_performance(
    trainee_id: str,
    exercise_id: str,
    limit: int = 5,
    session: Session = Depends(get_session)
):
    """Get previous performance data for an exercise by a trainee"""
    return crud_exercise_record.get_previous_performance(session, trainee_id, exercise_id, limit)