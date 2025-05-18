from typing import Optional
from datetime import date
from pydantic import BaseModel


class TraineeBase(BaseModel):
    name: str
    gender: str
    date_of_birth: date
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None


class TraineeCreate(TraineeBase):
    pass


class TraineeRead(TraineeBase):
    id: int
    trainer_id: int
