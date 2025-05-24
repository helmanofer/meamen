from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .trainee import Trainee

class Trainer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    phone: Optional[str] = None
    bio: Optional[str] = None

    trainees: Optional[List["Trainee"]] = Relationship(back_populates="trainer")
