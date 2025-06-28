from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class SessionTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = None
    equipment_needed: Optional[Dict[str, Any]] = None
    workout_structure: Optional[str] = None
    notes: Optional[str] = None


class SessionTemplateCreate(SessionTemplateBase):
    pass


class SessionTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = None
    equipment_needed: Optional[Dict[str, Any]] = None
    workout_structure: Optional[str] = None
    notes: Optional[str] = None


class SessionTemplateRead(SessionTemplateBase):
    id: str
    trainer_id: str
    is_default: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True