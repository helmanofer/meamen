from sqlmodel import select
from meamen.models.training_session import TrainingSession
from meamen.schemas.training_session import TrainingSessionCreate, TrainingSessionUpdate
from sqlmodel import Session
from typing import Optional, Sequence


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
