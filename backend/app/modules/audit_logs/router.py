"""
Router for Audit Log endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.modules.audit_logs import service
from app.modules.audit_logs.schema import AuditLogResponse, PaginatedResponse

router = APIRouter(
    prefix="/audit-logs",
    tags=["audit_logs"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=PaginatedResponse[AuditLogResponse])
def list_audit_logs(
    skip: int = 0,
    limit: int = 10,
    event_type: Optional[str] = None,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get all audit logs with pagination and filtering
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)
    - event_type: Filter by event type (optional)
    - employee_id: Filter by employee ID (optional)
    
    Example: GET /audit-logs?skip=0&limit=10&event_type=event_created&employee_id=1
    """
    if limit > 100:
        limit = 100
    
    logs, total = service.get_all_audit_logs(
        db=db,
        skip=skip,
        limit=limit,
        event_type=event_type,
        employee_id=employee_id
    )
    
    return PaginatedResponse[AuditLogResponse](
        items=logs,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/{log_id}", response_model=AuditLogResponse)
def get_audit_log(
    log_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single audit log by ID
    
    Path Parameters:
    - log_id: The ID of the audit log to retrieve
    
    Example: GET /audit-logs/1
    """
    audit_log = service.get_audit_log_by_id(db=db, log_id=log_id)
    
    if not audit_log:
        raise HTTPException(
            status_code=404,
            detail=f"Audit log with id {log_id} not found"
        )
    
    return audit_log
