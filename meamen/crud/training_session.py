from sqlmodel import select
from meamen.models.training_session import TrainingSession, TrainingSessionRecord, SessionStatus, TrainingSessionRecordTraineeLink
from meamen.models.trainee import Trainee
from meamen.schemas.training_session import (
    TrainingSessionCreate, 
    TrainingSessionUpdate,
    TrainingSessionRecordCreate,
    TrainingSessionRecordUpdate,
    TrainingSessionStartRequest
)
from meamen.api.websockets import manager
from sqlmodel import Session
from typing import Optional, Sequence, List
from datetime import datetime, UTC


def create_training_session(
    db: Session, session_in: TrainingSessionCreate
) -> TrainingSession:
    session_obj = TrainingSession(**session_in.model_dump())
    db.add(session_obj)
    db.commit()
    db.refresh(session_obj)
    return session_obj


def get_training_session(
    db: Session, session_id: int
) -> Optional[TrainingSession]:
    result = db.exec(
        select(TrainingSession).where(TrainingSession.id == session_id)
    )
    return result.first()


def get_training_sessions(
    db: Session, skip: int = 0, limit: int = 100
) -> Sequence[TrainingSession]:
    result = db.exec(select(TrainingSession).offset(skip).limit(limit))
    return result.all()


def update_training_session(
    db: Session, session_id: int, session_in: TrainingSessionUpdate
) -> Optional[TrainingSession]:
    session_obj = get_training_session(db, session_id)
    if not session_obj:
        return None
    for field, value in session_in.model_dump(exclude_unset=True).items():
        setattr(session_obj, field, value)
    db.add(session_obj)
    db.commit()
    db.refresh(session_obj)
    return session_obj


def delete_training_session(db: Session, session_id: int) -> bool:
    session_obj = get_training_session(db, session_id)
    if not session_obj:
        return False
    db.delete(session_obj)
    db.commit()
    return True


def start_training_session(
    db: Session, trainer_id: int, request: TrainingSessionStartRequest
) -> TrainingSessionRecord:
    current_time = datetime.now(UTC)
    
    # Create a single session record
    record = TrainingSessionRecord(
        training_session_id=request.session_template_id,
        trainer_id=trainer_id,
        start_time=current_time,
        location=request.location,
        trainer_notes=request.notes,
        is_live=True,
        status=SessionStatus.ACTIVE,
        session_metadata={"start_method": "api", "multi_trainee": len(request.trainee_ids) > 1}
    )
    
    # Get trainee objects
    trainees = db.exec(select(Trainee).where(Trainee.id.in_(request.trainee_ids))).all()
    if len(trainees) != len(request.trainee_ids):
        raise Exception("Some trainees not found")

    record.trainees.extend(trainees)
    
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return record


def get_training_session_record(
    db: Session, record_id: int
) -> Optional[TrainingSessionRecord]:
    result = db.exec(
        select(TrainingSessionRecord).where(TrainingSessionRecord.id == record_id)
    )
    return result.first()


def get_active_session_records(
    db: Session, trainer_id: int
) -> Sequence[TrainingSessionRecord]:
    result = db.exec(
        select(TrainingSessionRecord)
        .where(TrainingSessionRecord.trainer_id == trainer_id)
        .where(TrainingSessionRecord.status.in_([SessionStatus.ACTIVE, SessionStatus.PAUSED]))
        .where(TrainingSessionRecord.is_live == True)
    )
    return result.all()


def update_session_status(
    db: Session, record_id: int, status: SessionStatus
) -> Optional[TrainingSessionRecord]:
    record = get_training_session_record(db, record_id)
    if not record:
        return None
    
    record.status = status
    record.updated_at = datetime.now(UTC)
    
    if status == SessionStatus.COMPLETED:
        record.completed = True
        record.is_live = False
        record.end_time = datetime.now(UTC)
    elif status == SessionStatus.ACTIVE and record.start_time is None:
        record.start_time = datetime.now(UTC)
        record.is_live = True
    
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update_training_session_record(
    db: Session, record_id: int, record_in: TrainingSessionRecordUpdate
) -> Optional[TrainingSessionRecord]:
    record = get_training_session_record(db, record_id)
    if not record:
        return None
    
    for field, value in record_in.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    
    record.updated_at = datetime.now(UTC)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
