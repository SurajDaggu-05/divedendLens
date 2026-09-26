from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from app.core.config import settings


# SQLAlchemy 2.x declarative base class
class Base(DeclarativeBase):
    pass


# Configure engine options based on database type
engine_args = {
    "pool_pre_ping": True,
    "echo": False,
}

if settings.DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    **engine_args
)

# Create sessionmaker factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining database sessions in FastAPI endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
