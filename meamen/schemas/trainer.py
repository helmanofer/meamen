from typing import Optional
from pydantic import BaseModel


class TrainerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    bio: Optional[str] = None


class TrainerCreate(TrainerBase):
    pass


class TrainerRead(TrainerBase):
    id: int
