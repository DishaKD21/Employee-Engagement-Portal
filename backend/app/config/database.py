"""
Database configuration and SQLAlchemy setup
Initializes SQLAlchemy engine, session factory, and base model class
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config.settings import DATABASE_URL

# Create SQLAlchemy engine
# pool_pre_ping=True helps detect stale connections
# echo=False for production (set to True for debugging SQL queries)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=True,
    connect_args={"options": "-csearch_path=ethan,public"}
)

# Create session factory
# This factory will be used to create new database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Declarative base for all ORM models
# All model classes will inherit from this
Base = declarative_base()


def get_db():
    """
    Dependency injection function for FastAPI endpoints
    Provides a database session for each request
    
    Example usage in FastAPI:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            # Use db to query
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
