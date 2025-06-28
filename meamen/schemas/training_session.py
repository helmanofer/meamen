from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel
from meamen.models.training_session import SessionStatus
from meamen.schemas.trainee import TraineeRead


class TrainingSessionBase(BaseModel):
    trainer_id: int
    name: str
    description: Optional[str] = None
    scheduled_time: Optional[datetime] = None


class TrainingSessionCreate(TrainingSessionBase):
    pass


class TrainingSessionRead(TrainingSessionBase):
    id: int
    created_at: datetime


class TrainingSessionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    scheduled_time: Optional[datetime] = None


class TrainingSessionRecordBase(BaseModel):
    training_session_id: Optional[int] = None
    trainer_id: int
    session_date: Optional[date] = None
    location: Optional[str] = None
    trainer_notes: Optional[str] = None


class TrainingSessionRecordCreate(TrainingSessionRecordBase):
    pass


class TrainingSessionRecordRead(TrainingSessionRecordBase):
    id: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    completed: bool
    is_live: bool
    status: SessionStatus
    trainee_feedback: Optional[dict] = None
    session_metadata: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    trainees: List[TraineeRead] = []


class TrainingSessionRecordUpdate(BaseModel):
    location: Optional[str] = None
    trainer_notes: Optional[str] = None
    trainee_feedback: Optional[dict] = None
    session_metadata: Optional[dict] = None


class TrainingSessionStartRequest(BaseModel):
    trainee_ids: List[int]
    session_template_id: Optional[int] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class TrainingSessionStatusUpdate(BaseModel):
    status: SessionStatus
