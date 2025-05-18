from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class TrainingSessionBase(BaseModel):
    trainee_id: int
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
