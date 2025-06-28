from typing import Optional, TYPE_CHECKING, List
from datetime import datetime, UTC, date
from uuid import uuid4
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
from enum import Enum
from meamen.models.program import Program

if TYPE_CHECKING:
    from .trainee import Trainee

def uuid4_str():
    return str(uuid4())

class SessionStatus(str, Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TrainingSession(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=uuid4_str, primary_key=True)
    program_id: Optional[str] = Field(foreign_key="program.id")
    session_template_id: Optional[str] = Field(foreign_key="sessiontemplate.id")
    trainer_id: str = Field(foreign_key="trainer.id")
    name: str
    description: Optional[str] = None
    session_type: Optional[str] = None
    focus_area: Optional[str] = None
    estimated_duration: Optional[int] = None
    warmup: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    cooldown: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    week_number: Optional[int] = None
    session_number: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Relationships
    program: Optional["Program"] = Relationship(back_populates="training_sessions")
    records: List["TrainingSessionRecord"] = Relationship(back_populates="training_session")


class TrainingSessionRecordTraineeLink(SQLModel, table=True):
    __tablename__ = "training_session_record_trainee_link"
    session_record_id: Optional[str] = Field(default=None, foreign_key="training_session_record.id", primary_key=True)
    trainee_id: Optional[str] = Field(default=None, foreign_key="trainee.id", primary_key=True)


class TrainingSessionRecord(SQLModel, table=True):
    __tablename__ = "training_session_record"
    
    id: Optional[str] = Field(default_factory=uuid4_str, primary_key=True)
    training_session_id: Optional[str] = Field(default=None, foreign_key="trainingsession.id")
    trainer_id: str = Field(foreign_key="trainer.id")
    session_date: date = Field(default_factory=lambda: datetime.now(UTC).date())
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    completed: bool = Field(default=False)
    is_live: bool = Field(default=False)
    status: SessionStatus = Field(default=SessionStatus.SCHEDULED)
    trainer_notes: Optional[str] = None
    trainee_feedback: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    session_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    training_session: Optional["TrainingSession"] = Relationship(back_populates="records")
    trainees: List["Trainee"] = Relationship(back_populates="session_records", link_model=TrainingSessionRecordTraineeLink)