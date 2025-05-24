from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, create_engine

# Import all models to ensure their tables are registered with SQLModel's metadata
from meamen.models import (
    exercise, # noqa: F401  # pyright: ignore[reportUnusedImport]
    trainee, # noqa: F401  # pyright: ignore[reportUnusedImport]
    trainer, # noqa: F401  # pyright: ignore[reportUnusedImport]
    training_session, # noqa: F401  # pyright: ignore[reportUnusedImport]
    user, # noqa: F401  # pyright: ignore[reportUnusedImport]
)

DB_FILE = "./test.db"
ASYNC_DATABASE_URL = f"sqlite+aiosqlite:///{DB_FILE}"
SYNC_DATABASE_URL = f"sqlite:///{DB_FILE}"
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)  # type: ignore


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:  # type: ignore
        session: AsyncSession  # type: ignore
        yield session

sync_engine = create_engine(SYNC_DATABASE_URL, echo=True)

SQLModel.metadata.create_all(sync_engine)

if __name__ == "__main__":
    pass
