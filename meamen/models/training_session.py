from typing import Optional, TYPE_CHECKING
from datetime import datetime, UTC
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .trainee import Trainee


class TrainingSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trainee_id: int = Field(foreign_key="trainee.id")
    trainer_id: int
    name: str
    description: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    trainee: Optional["Trainee"] = Relationship(back_populates="training_sessions")
