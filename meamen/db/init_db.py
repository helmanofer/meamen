from sqlmodel import SQLModel
from meamen.db.session import engine


def init_db():
    SQLModel.metadata.create_all(engine)


if __name__ == "__main__":
    init_db()
