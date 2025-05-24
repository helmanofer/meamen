from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, UTC


class SessionTemplate(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    category: Optional[str] = None  # Strength, Cardio, Full Body, etc.
    difficulty: Optional[str] = None  # Beginner, Intermediate, Advanced
    duration_minutes: Optional[int] = None  # Estimated duration
    equipment_needed: Optional[str] = None  # Comma-separated list
    workout_structure: Optional[str] = None  # JSON string with exercises, sets, reps
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))