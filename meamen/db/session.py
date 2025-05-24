
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from typing import Generator, AsyncGenerator

# Import all models to ensure their tables are registered with SQLModel's metadata
from meamen.models import (
    exercise,  # noqa: F401  # type: ignore
    trainee,  # noqa: F401  #  type: ignore
    trainer,  # noqa: F401  #  type: ignore
    user,  # noqa: F401  #  type: ignore
    training_session,  # noqa: F401  #  type: ignore
    session_template,  # noqa: F401  #  type: ignore
)

DB_FILE = "./test.db"
SYNC_DATABASE_URL = f"sqlite:///{DB_FILE}"
ASYNC_DATABASE_URL = f"sqlite+aiosqlite:///{DB_FILE}"

sync_engine = create_engine(SYNC_DATABASE_URL, echo=True)
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(async_engine, expire_on_commit=False)


def get_session() -> Generator[Session, None, None]:
    with Session(sync_engine) as session:
        yield session


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


SQLModel.metadata.create_all(sync_engine)
