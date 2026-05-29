import logging
import os
import re

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

logger = logging.getLogger("ai-service.db")

database_url = os.getenv("DATABASE_URL", settings.database_url)
parsed_url = make_url(database_url)
endpoint_type = "pooler" if "pooler" in (parsed_url.host or "") else "direct"

logger.info(
    "Using Neon database host=%s database=%s user=%s endpoint_type=%s",
    parsed_url.host,
    parsed_url.database,
    parsed_url.username,
    endpoint_type,
)

engine_url = re.sub(r"^postgresql:", "postgresql+psycopg:", database_url, count=1)
engine = create_engine(engine_url, pool_pre_ping=True)


SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def init_db() -> None:
    from app.models import rag_vector  # noqa: F401

    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))

    with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        Base.metadata.create_all(bind=connection)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()