from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from meamen.schemas.training_session import (
    TrainingSessionCreate,
    TrainingSessionRead,
    TrainingSessionUpdate,
)
from meamen.crud.training_session import (
    create_training_session,
    get_training_session,
    get_training_sessions,
    update_training_session,
    delete_training_session,
)
from meamen.db.session import get_session

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
