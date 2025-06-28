from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from meamen.models.exercise_record import ExerciseStatus


class SetData(BaseModel):
    set_number: int
    reps: Optional[int] = None
    weight: Optional[float] = None
    duration: Optional[int] = None  # in seconds
    rest_time: Optional[int] = None  # in seconds
    completed: bool = False
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None


class ExerciseRecordBase(BaseModel):
    session_record_id: str
    exercise_id: Optional[str] = None
    trainee_id: Optional[str] = None
    trainer_id: Optional[str] = None
    exercise_name: str
    target_sets: Optional[int] = None
    target_reps: Optional[int] = None
    target_weight: Optional[float] = None
    target_duration: Optional[int] = None
    rest_period_seconds: Optional[int] = None
    trainer_notes: Optional[str] = None


class ExerciseRecordCreate(ExerciseRecordBase):
    pass


class ExerciseRecordRead(ExerciseRecordBase):
    id: str
    sets_data: Optional[List[SetData]] = None
    completed_sets: int
    status: ExerciseStatus
    form_rating: Optional[int] = None
    rpe: Optional[int] = None
    trainee_feedback: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class ExerciseRecordUpdate(BaseModel):
    status: Optional[ExerciseStatus] = None
    form_rating: Optional[int] = Field(None, ge=1, le=5, description="Form rating 1-5")
    rpe: Optional[int] = Field(None, ge=1, le=10, description="RPE 1-10")
    trainer_notes: Optional[str] = None
    trainee_feedback: Optional[str] = None


class SetRecordRequest(BaseModel):
    set_number: int
    reps: Optional[int] = None
    weight: Optional[float] = None
    duration: Optional[int] = None
    rest_time: Optional[int] = None
    notes: Optional[str] = None


class BulkSetRecordRequest(BaseModel):
    sets: List[SetRecordRequest]