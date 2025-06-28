from typing import Optional, TYPE_CHECKING
from datetime import datetime, UTC
from uuid import uuid4
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from enum import Enum

if TYPE_CHECKING:
    from .training_session import TrainingSessionRecord
    from .exercise_template import ExerciseTemplate

def uuid4_str():
    return str(uuid4())

class ExerciseStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"

class ExerciseRecord(SQLModel, table=True):
    __tablename__ = "exercise_record"
    
    id: Optional[str] = Field(default_factory=uuid4_str, primary_key=True)
    session_record_id: str = Field(foreign_key="training_session_record.id")
    exercise_template_id: Optional[str] = Field(foreign_key="exercisetemplate.id")
    
    # Core exercise information (from schema)
    exercise_name: str
    exercise_description: Optional[str] = None
    category: Optional[str] = None
    muscle_groups: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    difficulty: Optional[str] = None
    equipment: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    order_index: int = Field(default=0)
    
    # Performance data (from schema)
    sets: Optional[dict] = Field(default=None, sa_column=Column(JSON))  # Schema field
    notes: Optional[str] = None
    perceived_exertion: Optional[int] = None  # RPE 1-10 (schema field)
    form_rating: Optional[int] = None  # 1-5 (schema field)
    completed: bool = Field(default=False)  # Schema field
    skipped: bool = Field(default=False)  # Schema field
    modification_notes: Optional[str] = None  # Schema field
    
    # Additional fields for API compatibility
    exercise_id: Optional[str] = Field(foreign_key="exercise.id")  # For backward compatibility
    trainee_id: Optional[str] = Field(foreign_key="trainee.id")  # For API compatibility
    trainer_id: Optional[str] = Field(foreign_key="trainer.id")  # For API compatibility
    sets_data: Optional[list] = Field(default=None, sa_column=Column(JSON))  # API compatibility
    completed_sets: int = Field(default=0)  # API compatibility
    status: ExerciseStatus = Field(default=ExerciseStatus.NOT_STARTED)  # API compatibility
    target_sets: Optional[int] = None  # API compatibility
    target_reps: Optional[int] = None  # API compatibility
    target_weight: Optional[float] = None  # API compatibility
    target_duration: Optional[int] = None  # API compatibility
    rest_period_seconds: Optional[int] = None # API compatibility
    rpe: Optional[int] = None  # API compatibility (alias for perceived_exertion)
    trainer_notes: Optional[str] = None  # API compatibility
    trainee_feedback: Optional[str] = None  # API compatibility
    
    # Timestamps (schema compliant)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    
    # Relationships
    session_record: Optional["TrainingSessionRecord"] = Relationship()
    exercise_template: Optional["ExerciseTemplate"] = Relationship(back_populates="exercise_records")