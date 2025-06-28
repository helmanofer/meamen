from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, UTC
from uuid import uuid4
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from decimal import Decimal

def uuid4_str():
    return str(uuid4())

class ExerciseTemplate(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=uuid4_str, primary_key=True)
    session_template_id: str = Field(foreign_key="sessiontemplate.id")
    exercise_name: str
    exercise_description: Optional[str] = None
    category: Optional[str] = None
    muscle_groups: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    difficulty: Optional[str] = None
    equipment: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    order_index: int
    target_sets: Optional[int] = None
    target_reps: Optional[int] = None
    target_weight: Optional[float] = None
    rest_between_sets: Optional[int] = None  # in seconds
    instructions: Optional[str] = None
    tips: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Relationships
    if TYPE_CHECKING:
        from .session_template import SessionTemplate
        from .exercise_record import ExerciseRecord
    session_template: Optional["SessionTemplate"] = Relationship(back_populates="exercise_templates")
    exercise_records: List["ExerciseRecord"] = Relationship(back_populates="exercise_template")