from sqlmodel import SQLModel
from sqlalchemy import create_engine
from meamen.db.session import DATABASE_URL


def init_db():
    sync_engine = create_engine(DATABASE_URL.replace("+aiosqlite", ""))
    SQLModel.metadata.create_all(sync_engine)


if __name__ == "__main__":
    init_db()
