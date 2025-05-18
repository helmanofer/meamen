from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime, UTC


class Exercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    category: Optional[str] = None  # Strength, Cardio, Flexibility, Balance
    muscle_groups: Optional[str] = None  # Comma-separated list
    difficulty: Optional[str] = None  # Beginner, Intermediate, Advanced
    equipment: Optional[str] = None  # Comma-separated list
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    instructions: Optional[str] = None
    tips: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
