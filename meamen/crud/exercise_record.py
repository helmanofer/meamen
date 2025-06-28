from typing import Optional, List
from datetime import datetime, UTC
from sqlmodel import Session, select, and_
from meamen.models.exercise_record import ExerciseRecord, ExerciseStatus
from meamen.schemas.exercise_record import (
    ExerciseRecordCreate, 
    ExerciseRecordUpdate, 
    SetRecordRequest,
    SetData
)


def create_exercise_record(session: Session, exercise_record: ExerciseRecordCreate) -> ExerciseRecord:
    """Create a new exercise record"""
    db_exercise_record = ExerciseRecord(**exercise_record.model_dump())
    db_exercise_record.sets_data = []  # Initialize empty sets
    session.add(db_exercise_record)
    session.commit()
    session.refresh(db_exercise_record)
    return db_exercise_record


def get_exercise_record(session: Session, exercise_record_id: str) -> Optional[ExerciseRecord]:
    """Get exercise record by ID"""
    return session.get(ExerciseRecord, exercise_record_id)


def get_exercise_records_by_session(session: Session, session_record_id: str) -> List[ExerciseRecord]:
    """Get all exercise records for a training session"""
    statement = select(ExerciseRecord).where(ExerciseRecord.session_record_id == session_record_id)
    return list(session.exec(statement))


def get_exercise_records_by_trainee_and_session(
    session: Session, 
    trainee_id: str, 
    session_record_id: str
) -> List[ExerciseRecord]:
    """Get exercise records for a specific trainee in a session"""
    statement = select(ExerciseRecord).where(
        and_(
            ExerciseRecord.trainee_id == trainee_id,
            ExerciseRecord.session_record_id == session_record_id
        )
    )
    return list(session.exec(statement))


def update_exercise_record(
    session: Session, 
    exercise_record_id: str, 
    exercise_record_update: ExerciseRecordUpdate
) -> Optional[ExerciseRecord]:
    """Update exercise record"""
    db_exercise_record = session.get(ExerciseRecord, exercise_record_id)
    if not db_exercise_record:
        return None
    
    update_data = exercise_record_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_exercise_record, field, value)
    
    db_exercise_record.updated_at = datetime.now(UTC)
    session.add(db_exercise_record)
    session.commit()
    session.refresh(db_exercise_record)
    return db_exercise_record


def record_set(
    session: Session, 
    exercise_record_id: str, 
    set_record: SetRecordRequest
) -> Optional[ExerciseRecord]:
    """Record a single set for an exercise"""
    db_exercise_record = session.get(ExerciseRecord, exercise_record_id)
    if not db_exercise_record:
        return None
    
    # Initialize sets_data if it's None
    if db_exercise_record.sets_data is None:
        db_exercise_record.sets_data = []
    
    # Create set data with timestamp
    set_data = SetData(
        set_number=set_record.set_number,
        reps=set_record.reps,
        weight=set_record.weight,
        duration=set_record.duration,
        rest_time=set_record.rest_time,
        notes=set_record.notes,
        completed=True,
        recorded_at=datetime.now(UTC)
    )
    
    # Check if this set number already exists and update it
    existing_set_index = None
    for i, existing_set in enumerate(db_exercise_record.sets_data):
        if existing_set.get('set_number') == set_record.set_number:
            existing_set_index = i
            break
    
    if existing_set_index is not None:
        # Update existing set
        db_exercise_record.sets_data[existing_set_index] = set_data.model_dump()
    else:
        # Add new set
        db_exercise_record.sets_data.append(set_data.model_dump())
    
    # Update completed sets count
    db_exercise_record.completed_sets = len([s for s in db_exercise_record.sets_data if s.get('completed', False)])
    
    # Update status
    if db_exercise_record.status == ExerciseStatus.NOT_STARTED:
        db_exercise_record.status = ExerciseStatus.IN_PROGRESS
        db_exercise_record.started_at = datetime.now(UTC)
    
    # Check if exercise is complete
    if (db_exercise_record.target_sets and 
        db_exercise_record.completed_sets >= db_exercise_record.target_sets):
        db_exercise_record.status = ExerciseStatus.COMPLETED
        db_exercise_record.completed_at = datetime.now(UTC)
    
    db_exercise_record.updated_at = datetime.now(UTC)
    session.add(db_exercise_record)
    session.commit()
    session.refresh(db_exercise_record)
    return db_exercise_record


def record_bulk_sets(
    session: Session, 
    exercise_record_id: str, 
    sets: List[SetRecordRequest]
) -> Optional[ExerciseRecord]:
    """Record multiple sets at once"""
    db_exercise_record = session.get(ExerciseRecord, exercise_record_id)
    if not db_exercise_record:
        return None
    
    # Record each set
    for set_record in sets:
        record_set(session, exercise_record_id, set_record)
    
    # Refresh and return the updated record
    session.refresh(db_exercise_record)
    return db_exercise_record


def mark_exercise_complete(session: Session, exercise_record_id: str) -> Optional[ExerciseRecord]:
    """Mark an exercise as completed"""
    db_exercise_record = session.get(ExerciseRecord, exercise_record_id)
    if not db_exercise_record:
        return None
    
    db_exercise_record.status = ExerciseStatus.COMPLETED
    db_exercise_record.completed_at = datetime.now(UTC)
    db_exercise_record.updated_at = datetime.now(UTC)
    
    session.add(db_exercise_record)
    session.commit()
    session.refresh(db_exercise_record)
    return db_exercise_record


def mark_exercise_skipped(session: Session, exercise_record_id: str) -> Optional[ExerciseRecord]:
    """Mark an exercise as skipped"""
    db_exercise_record = session.get(ExerciseRecord, exercise_record_id)
    if not db_exercise_record:
        return None
    
    db_exercise_record.status = ExerciseStatus.SKIPPED
    db_exercise_record.completed_at = datetime.now(UTC)
    db_exercise_record.updated_at = datetime.now(UTC)
    
    session.add(db_exercise_record)
    session.commit()
    session.refresh(db_exercise_record)
    return db_exercise_record


def get_previous_performance(
    session: Session, 
    trainee_id: str, 
    exercise_id: str, 
    limit: int = 5
) -> List[ExerciseRecord]:
    """Get previous performance data for an exercise by a trainee"""
    statement = (
        select(ExerciseRecord)
        .where(
            and_(
                ExerciseRecord.trainee_id == trainee_id,
                ExerciseRecord.exercise_id == exercise_id,
                ExerciseRecord.status == ExerciseStatus.COMPLETED
            )
        )
        .order_by(ExerciseRecord.completed_at.desc())
        .limit(limit)
    )
    return list(session.exec(statement))