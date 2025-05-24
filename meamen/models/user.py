from uuid import uuid4
from typing import Optional
from sqlmodel import SQLModel, Field

def uuid4_str():
    return str(uuid4())

class User(SQLModel, table=True):
    id: Optional[str] = Field(default_factory=uuid4_str, primary_key=True, index=True)
    email: str = Field(index=True, unique=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    is_verified: bool = Field(default=False)
    # avatar_url: Optional[str] = Field(default=None, nullable=True)
