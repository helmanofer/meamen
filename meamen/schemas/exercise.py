from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ExerciseBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    muscle_groups: Optional[str] = None
    difficulty: Optional[str] = None
    equipment: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    instructions: Optional[str] = None
    tips: Optional[str] = None


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseRead(ExerciseBase):
    id: int
    created_at: datetime
    updated_at: datetime
