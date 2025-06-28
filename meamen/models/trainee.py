from typing import Optional, List, TYPE_CHECKING
from datetime import date, datetime, UTC
from uuid import uuid4
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from meamen.models.training_session import TrainingSessionRecordTraineeLink

def uuid4_str():
    return str(uuid4())

class TraineeProgramAssignment(SQLModel, table=True):
    """Association table for many-to-many relationship between trainees and programs"""
    id: Optional[str] = Field(default_factory=uuid4_str, primary_key=True)
    trainee_id: str = Field(foreign_key="trainee.id")
    program_id: str = Field(foreign_key="program.id") 
    assigned_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    status: str = Field(default="active")  # active, completed, paused
    notes: Optional[str] = None
    
    # Relationships
    if TYPE_CHECKING:
        from .program import Program
    trainee: Optional["Trainee"] = Relationship(back_populates="program_assignments")
    program: Optional["Program"] = Relationship()


class Trainee(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=uuid4_str, primary_key=True)
    trainer_id: str = Field(foreign_key="trainer.id")
    
    # Personal information
    name: str
    gender: str
    date_of_birth: date
    email: str
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
    goals: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    injuries: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    medical_notes: Optional[str] = None

    # Measurement history
    measurement_history: Optional[List[dict]] = Field(default_factory=list, sa_column=Column(JSON))
    progress_photos: Optional[List[dict]] = Field(default_factory=list, sa_column=Column(JSON))

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Relationships
    if TYPE_CHECKING:
        from .trainer import Trainer
        from .training_session import TrainingSessionRecord
    trainer: Optional["Trainer"] = Relationship(back_populates="trainees")
    session_records: List["TrainingSessionRecord"] = Relationship(back_populates="trainees", link_model=TrainingSessionRecordTraineeLink)
    program_assignments: Optional[List["TraineeProgramAssignment"]] = Relationship(
        back_populates="trainee",
        sa_relationship_kwargs={"lazy": "noload"}
    )
