from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from meamen.schemas.training_session import (
    TrainingSessionCreate,
    TrainingSessionRead,
    TrainingSessionUpdate,
    TrainingSessionRecordRead,
    TrainingSessionRecordUpdate,
    TrainingSessionStartRequest,
    TrainingSessionStatusUpdate,
)
from meamen.crud.training_session import (
    create_training_session,
    get_training_session,
    get_training_sessions,
    update_training_session,
    delete_training_session,
    start_training_session,
    get_training_session_record,
    get_active_session_records,
    update_session_status,
    update_training_session_record,
)
from meamen.db.session import get_session
from meamen.models.training_session import SessionStatus

router = APIRouter(prefix="/training-sessions", tags=["Training Sessions"])


@router.post(
    "/", response_model=TrainingSessionRead, status_code=status.HTTP_201_CREATED
)
def create(
    session_in: TrainingSessionCreate, db: Session = Depends(get_session)
):
    session_obj = create_training_session(db, session_in)
    return session_obj


@router.get("/{session_id}", response_model=TrainingSessionRead)
def read(session_id: int, db: Session = Depends(get_session)):
    session_obj = get_training_session(db, session_id)
    if not session_obj:
        raise HTTPException(status_code=404, detail="Training session not found")
    return session_obj


@router.get("/", response_model=List[TrainingSessionRead])
def read_all(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_session)
):
    return get_training_sessions(db, skip=skip, limit=limit)


@router.put("/{session_id}", response_model=TrainingSessionRead)
def update(
    session_id: int,
    session_in: TrainingSessionUpdate,
    db: Session = Depends(get_session),
):
    session_obj = update_training_session(db, session_id, session_in)
    if not session_obj:
        raise HTTPException(status_code=404, detail="Training session not found")
    return session_obj


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(session_id: int, db: Session = Depends(get_session)):
    success = delete_training_session(db, session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Training session not found")


@router.post("/start", response_model=TrainingSessionRecordRead, status_code=status.HTTP_201_CREATED)
def start_session(
    request: TrainingSessionStartRequest,
    trainer_id: int = 1,  # TODO: Get from auth context
    db: Session = Depends(get_session)
):
    if not request.trainee_ids:
        raise HTTPException(status_code=400, detail="At least one trainee must be selected")
    
    record = start_training_session(db, trainer_id, request)
    return record


@router.get("/active", response_model=List[TrainingSessionRecordRead])
def get_active_sessions(
    trainer_id: int = 1,  # TODO: Get from auth context
    db: Session = Depends(get_session)
):
    return get_active_session_records(db, trainer_id)


@router.get("/records/{record_id}", response_model=TrainingSessionRecordRead)
def get_session_record(record_id: int, db: Session = Depends(get_session)):
    record = get_training_session_record(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Training session record not found")
    return record


@router.patch("/records/{record_id}/pause", response_model=TrainingSessionRecordRead)
def pause_session(record_id: int, db: Session = Depends(get_session)):
    record = update_session_status(db, record_id, SessionStatus.PAUSED)
    if not record:
        raise HTTPException(status_code=404, detail="Training session record not found")
    return record


@router.patch("/records/{record_id}/resume", response_model=TrainingSessionRecordRead)
def resume_session(record_id: int, db: Session = Depends(get_session)):
    record = update_session_status(db, record_id, SessionStatus.ACTIVE)
    if not record:
        raise HTTPException(status_code=404, detail="Training session record not found")
    return record


@router.patch("/records/{record_id}/complete", response_model=TrainingSessionRecordRead)
def complete_session(record_id: int, db: Session = Depends(get_session)):
    record = update_session_status(db, record_id, SessionStatus.COMPLETED)
    if not record:
        raise HTTPException(status_code=404, detail="Training session record not found")
    return record


@router.patch("/records/{record_id}", response_model=TrainingSessionRecordRead)
def update_session_record(
    record_id: int,
    record_in: TrainingSessionRecordUpdate,
    db: Session = Depends(get_session)
):
    record = update_training_session_record(db, record_id, record_in)
    if not record:
        raise HTTPException(status_code=404, detail="Training session record not found")
    return record
