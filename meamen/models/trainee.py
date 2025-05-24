from typing import Optional, List, TYPE_CHECKING
from datetime import date, datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column
from sqlalchemy.types import JSON


class TraineeProgramAssignment(SQLModel, table=True):
    """Association table for many-to-many relationship between trainees and programs"""
    id: Optional[int] = Field(default=None, primary_key=True)
    trainee_id: int = Field(foreign_key="trainee.id")
    program_id: int = Field(foreign_key="sessiontemplate.id") 
    assigned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = Field(default="active")  # active, completed, paused
    notes: Optional[str] = None
    
    # Relationships
    if TYPE_CHECKING:
        from .session_template import SessionTemplate
    trainee: Optional["Trainee"] = Relationship(back_populates="program_assignments")
    program: Optional["SessionTemplate"] = Relationship()


class Trainee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trainer_id: int = Field(foreign_key="trainer.id")
    
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
    goals: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    injuries: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))
    medical_notes: Optional[str] = None

    # Measurement history
    measurement_history: Optional[List[dict[str, str]]] = Field(default_factory=list, sa_column=Column(JSON))
    progress_photos: Optional[List[dict[str, str]]] = Field(default_factory=list, sa_column=Column(JSON))

    # Timestamps
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    if TYPE_CHECKING:
        from .trainer import Trainer
        from .training_session import TrainingSession
    trainer: Optional["Trainer"] = Relationship(back_populates="trainees")
    training_sessions: List["TrainingSession"] = Relationship(back_populates="trainee")
    program_assignments: Optional[List["TraineeProgramAssignment"]] = Relationship(
        back_populates="trainee",
        sa_relationship_kwargs={"lazy": "noload"}
    )
