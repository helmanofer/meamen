from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, EmailStr


class MeasurementRecord(BaseModel):
    date: date
    weight: Optional[float] = None
    body_fat: Optional[float] = None
    measurements: Optional[dict] = None  # chest, waist, hips, biceps, thighs in cm


class ProgressPhoto(BaseModel):
    date: date
    photo_url: str


class TraineeBase(BaseModel):
    name: str
    gender: str
    date_of_birth: date
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    
    # Health metrics
    height: Optional[float] = None  # in cm
    current_weight: Optional[float] = None  # in kg
    body_fat_percentage: Optional[float] = None
    resting_heart_rate: Optional[int] = None
    
    # Fitness profile
    fitness_level: Optional[str] = None  # Beginner, Intermediate, Advanced
    goals: Optional[List[str]] = None
    injuries: Optional[List[str]] = None
    medical_notes: Optional[str] = None


class TraineeCreate(TraineeBase):
    pass


class TraineeUpdate(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    
    # Health metrics
    height: Optional[float] = None
    current_weight: Optional[float] = None
    body_fat_percentage: Optional[float] = None
    resting_heart_rate: Optional[int] = None
    
    # Fitness profile
    fitness_level: Optional[str] = None
    goals: Optional[List[str]] = None
    injuries: Optional[List[str]] = None
    medical_notes: Optional[str] = None


class ProgramAssignmentRead(BaseModel):
    id: int
    program_id: int
    assigned_at: datetime
    status: str
    notes: Optional[str] = None


class TraineeRead(TraineeBase):
    id: int
    trainer_id: int
    program_assignments: Optional[List[ProgramAssignmentRead]] = None
    measurement_history: List[MeasurementRecord] = []
    progress_photos: List[ProgressPhoto] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TraineeWithMeasurements(TraineeRead):
    pass


class ProgramAssignment(BaseModel):
    program_id: int
