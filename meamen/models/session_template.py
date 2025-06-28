from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, UTC
from uuid import uuid4
from sqlmodel import SQLModel, Field, Relationship, JSON, Column

def uuid4_str():
    return str(uuid4())

class SessionTemplate(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=uuid4_str, primary_key=True)
    trainer_id: str = Field(foreign_key="trainer.id")
    name: str
    description: Optional[str] = None
    category: Optional[str] = None  # Strength, Cardio, Full Body, etc.
    difficulty: Optional[str] = None  # Beginner, Intermediate, Advanced
    duration_minutes: Optional[int] = None  # Estimated duration
    equipment_needed: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    notes: Optional[str] = None
    is_default: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Relationships
    if TYPE_CHECKING:
        from .exercise_template import ExerciseTemplate
    exercise_templates: List["ExerciseTemplate"] = Relationship(back_populates="session_template")
