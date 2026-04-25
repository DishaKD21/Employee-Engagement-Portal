"""
Service layer for Audit Logs module
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.audit_model import AuditLog
from app.modules.service_utils import (
    DatabaseReadError,
    clean_pagination,
    clean_string,
    raise_database_error,
)


def get_all_audit_logs(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    event_type: Optional[str] = None,
    employee_id: Optional[int] = None
) -> tuple[List[AuditLog], int]:
    """
    Get all audit logs with pagination and filtering
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Number of records to return
        event_type: Filter by event type
        employee_id: Filter by employee ID
        
    Returns:
        Tuple of (audit logs list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        event_type = clean_string(event_type, lowercase=True)

        query = db.query(AuditLog).order_by(AuditLog.created_at.desc())

        if event_type is not None:
            query = query.filter(AuditLog.event_type == event_type)
        if employee_id is not None:
            query = query.filter(AuditLog.employee_id == employee_id)

        total = query.count()
        audit_logs = query.offset(skip).limit(limit).all()

        return audit_logs, total
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_audit_log_by_id(db: Session, log_id: int) -> Optional[AuditLog]:
    """
    Get a single audit log by ID
    
    Args:
        db: Database session
        log_id: ID of audit log to retrieve
        
    Returns:
        AuditLog or None if not found
    """
    try:
        return db.query(AuditLog).filter(AuditLog.log_id == log_id).first()
    except DatabaseReadError as exc:
        raise_database_error(db, exc)
