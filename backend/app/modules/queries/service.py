"""
Service layer for Queries module
"""
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.knowledge_model import QueryEscalation, QueryLog, QueryStatusEnum
from app.modules.service_utils import (
    DatabaseReadError,
    clean_enum_value,
    clean_pagination,
    raise_database_error,
)


def get_all_queries(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    employee_id: Optional[int] = None
) -> tuple[List[QueryLog], int]:
    """
    Get all queries with pagination
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Number of records to return
        employee_id: Filter by employee ID
        
    Returns:
        Tuple of (queries list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        query = db.query(QueryLog)

        if employee_id is not None:
            query = query.filter(QueryLog.employee_id == employee_id)

        total = query.count()
        queries = query.offset(skip).limit(limit).all()

        return queries, total
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_query_by_id(db: Session, query_id: int) -> Optional[QueryLog]:
    """
    Get a single query by ID
    
    Args:
        db: Database session
        query_id: ID of query to retrieve
        
    Returns:
        QueryLog or None if not found
    """
    try:
        return db.query(QueryLog).filter(QueryLog.query_id == query_id).first()
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_escalations(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    status: Optional[str] = None
) -> tuple[List[QueryEscalation], int]:
    """
    Get query escalations with pagination
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Number of records to return
        status: Filter by status (open/resolved)
        
    Returns:
        Tuple of (escalations list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        status = clean_enum_value(status, QueryStatusEnum, "status")

        query = db.query(QueryEscalation)

        if status is not None:
            query = query.filter(QueryEscalation.status == status)

        total = query.count()
        escalations = query.offset(skip).limit(limit).all()

        return escalations, total
    except HTTPException:
        raise
    except DatabaseReadError as exc:
        raise_database_error(db, exc)
