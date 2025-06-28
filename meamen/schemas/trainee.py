from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID

class MeasurementRecord(BaseModel):
    date: date
    weight: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    notes: Optional[str] = None

class ProgressPhoto(BaseModel):
    date: date
    url: str
    notes: Optional[str] = None

class ProgramAssignment(BaseModel):
    id: str
    trainee_id: str
    program_id: str
    assigned_at: datetime
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class ProgramAssignmentRequest(BaseModel):
    program_id: str

class TraineeBase(BaseModel):
    name: str
    gender: str
    date_of_birth: date
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    height: Optional[float] = None
    current_weight: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    resting_heart_rate: Optional[int] = None
    fitness_level: Optional[str] = None
    goals: Optional[List[str]] = None
    injuries: Optional[List[str]] = None
    medical_notes: Optional[str] = None
    measurement_history: Optional[List[MeasurementRecord]] = None
    progress_photos: Optional[List[ProgressPhoto]] = None

class TraineeCreate(TraineeBase):
    trainer_id: str

class TraineeUpdate(TraineeBase):
    name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    email: Optional[str] = None

class TraineeRead(TraineeBase):
    id: str
    trainer_id: str
    created_at: datetime
    updated_at: datetime
    program_assignments: Optional[List[ProgramAssignment]] = None

    class Config:
        from_attributes = True
