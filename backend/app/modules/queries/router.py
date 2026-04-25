"""
Router for Query endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.modules.queries import service
from app.modules.queries.schema import (
    QueryLogResponse,
    QueryEscalationResponse,
    PaginatedResponse
)

router = APIRouter(
    prefix="/queries",
    tags=["queries"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=PaginatedResponse[QueryLogResponse])
def list_queries(
    skip: int = 0,
    limit: int = 10,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get all queries with pagination
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)
    - employee_id: Filter by employee ID (optional)
    
    Example: GET /queries?skip=0&limit=10&employee_id=1
    """
    if limit > 100:
        limit = 100
    
    queries, total = service.get_all_queries(
        db=db,
        skip=skip,
        limit=limit,
        employee_id=employee_id
    )
    
    return PaginatedResponse[QueryLogResponse](
        items=queries,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/escalations/list", response_model=PaginatedResponse[QueryEscalationResponse])
def list_escalations(
    skip: int = 0,
    limit: int = 10,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all query escalations

    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)
    - status: Filter by status (open/resolved)

    Example: GET /queries/escalations/list?status=open
    """
    if limit > 100:
        limit = 100

    escalations, total = service.get_escalations(
        db=db,
        skip=skip,
        limit=limit,
        status=status
    )

    return PaginatedResponse[QueryEscalationResponse](
        items=escalations,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/{query_id}", response_model=QueryLogResponse)
def get_query(
    query_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single query by ID
    
    Path Parameters:
    - query_id: The ID of the query to retrieve
    
    Example: GET /queries/1
    """
    query = service.get_query_by_id(db=db, query_id=query_id)
    
    if not query:
        raise HTTPException(
            status_code=404,
            detail=f"Query with id {query_id} not found"
        )
    
    return query


