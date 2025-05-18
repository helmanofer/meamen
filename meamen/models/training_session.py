from typing import Optional
from datetime import datetime, UTC
from sqlmodel import SQLModel, Field


class TrainingSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trainee_id: int
    trainer_id: int
    name: str
    description: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
