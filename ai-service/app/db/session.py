import logging
import os
import re

from pgvector.psycopg import register_vector
from sqlalchemy import create_engine, event, text
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


def get_database_schema() -> str:
    return os.getenv("DB_SCHEMA", "ethan")


engine_url = re.sub(r"^postgresql:", "postgresql+psycopg:", database_url, count=1)
database_schema = get_database_schema()
engine = create_engine(
    engine_url,
    pool_pre_ping=True,
    connect_args={"options": f"-c search_path={database_schema},public"},
)


@event.listens_for(engine, "connect")
def configure_connection(dbapi_connection, connection_record) -> None:
    register_vector(dbapi_connection)


SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def init_db() -> None:
    from app.models import rag_vector  # noqa: F401

    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        vector_schema = connection.execute(
            text("SELECT extnamespace::regnamespace::text FROM pg_extension WHERE extname = 'vector'")
        ).scalar_one_or_none() or "public"

    with engine.begin() as connection:
        search_path_schemas = list(dict.fromkeys([get_database_schema(), vector_schema, "public"]))
        quoted_search_path = ", ".join(f'"{schema}"' for schema in search_path_schemas)
        connection.execute(text(f"SET search_path TO {quoted_search_path}"))
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        Base.metadata.create_all(bind=connection)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()