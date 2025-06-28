from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, UTC
from uuid import uuid4
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .trainee import Trainee

def uuid4_str():
    return str(uuid4())

class Trainer(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=uuid4_str, primary_key=True)
    email: str = Field(unique=True)
    hashed_password: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    trainees: Optional[List["Trainee"]] = Relationship(back_populates="trainer")
