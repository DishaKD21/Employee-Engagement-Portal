"""
Service layer for Notifications module
"""
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.notification_model import Notification, NotificationStatusEnum
from app.modules.service_utils import (
    DatabaseReadError,
    clean_enum_value,
    clean_pagination,
    raise_database_error,
)


def get_all_notifications(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    employee_id: Optional[int] = None,
    status: Optional[str] = None
) -> tuple[List[Notification], int]:
    """
    Get all notifications with pagination and filtering
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Number of records to return
        employee_id: Filter by employee ID
        status: Filter by status (pending/sent/failed)
        
    Returns:
        Tuple of (notifications list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        status = clean_enum_value(status, NotificationStatusEnum, "status")

        query = db.query(Notification)

        if employee_id is not None:
            query = query.filter(Notification.employee_id == employee_id)
        if status is not None:
            query = query.filter(Notification.status == status)

        total = query.count()
        notifications = query.offset(skip).limit(limit).all()

        return notifications, total
    except HTTPException:
        raise
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_notification_by_id(
    db: Session,
    notification_id: int
) -> Optional[Notification]:
    """
    Get a single notification by ID
    
    Args:
        db: Database session
        notification_id: ID of notification to retrieve
        
    Returns:
        Notification or None if not found
    """
    try:
        return db.query(Notification).filter(
            Notification.notification_id == notification_id
        ).first()
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_employee_notifications(
    db: Session,
    employee_id: int,
    skip: int = 0,
    limit: int = 10
) -> tuple[List[Notification], int]:
    """
    Get all notifications for a specific employee
    
    Args:
        db: Database session
        employee_id: ID of employee
        skip: Number of records to skip
        limit: Number of records to return
        
    Returns:
        Tuple of (notifications list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        query = db.query(Notification).filter(
            Notification.employee_id == employee_id
        ).order_by(Notification.created_at.desc())

        total = query.count()
        notifications = query.offset(skip).limit(limit).all()

        return notifications, total
    except DatabaseReadError as exc:
        raise_database_error(db, exc)
