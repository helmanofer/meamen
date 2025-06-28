from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, UTC
from uuid import uuid4
from sqlmodel import SQLModel, Field, Relationship, JSON, Column

def uuid4_str():
    return str(uuid4())

class Program(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=uuid4_str, primary_key=True)
    trainer_id: str = Field(foreign_key="trainer.id")
    name: str
    description: Optional[str] = None
    difficulty: Optional[str] = None  # Beginner, Intermediate, Advanced
    duration_weeks: Optional[int] = None
    goals: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Relationships
    if TYPE_CHECKING:
        from .training_session import TrainingSession
    training_sessions: List["TrainingSession"] = Relationship(back_populates="program")