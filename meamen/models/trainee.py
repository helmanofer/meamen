from typing import Optional
from datetime import date
from sqlmodel import SQLModel, Field


class Trainee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    trainer_id: int
    name: str
    gender: str
    date_of_birth: date
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
