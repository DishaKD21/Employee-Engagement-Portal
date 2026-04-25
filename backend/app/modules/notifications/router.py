"""
Router for Notification endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.modules.notifications import service
from app.modules.notifications.schema import NotificationResponse, PaginatedResponse

router = APIRouter(
    prefix="/notifications",
    tags=["notifications"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=PaginatedResponse[NotificationResponse])
def list_notifications(
    skip: int = 0,
    limit: int = 10,
    employee_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all notifications with pagination
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)
    - employee_id: Filter by employee ID (optional)
    - status: Filter by status (pending/sent/failed)
    
    Example: GET /notifications?employee_id=1&status=sent
    """
    if limit > 100:
        limit = 100
    
    notifications, total = service.get_all_notifications(
        db=db,
        skip=skip,
        limit=limit,
        employee_id=employee_id,
        status=status
    )
    
    return PaginatedResponse[NotificationResponse](
        items=notifications,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/employee/{employee_id}", response_model=PaginatedResponse[NotificationResponse])
def get_employee_notifications(
    employee_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get all notifications for a specific employee

    Path Parameters:
    - employee_id: The ID of the employee

    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)

    Example: GET /notifications/employee/1?skip=0&limit=10
    """
    if limit > 100:
        limit = 100

    notifications, total = service.get_employee_notifications(
        db=db,
        employee_id=employee_id,
        skip=skip,
        limit=limit
    )

    return PaginatedResponse[NotificationResponse](
        items=notifications,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/{notification_id}", response_model=NotificationResponse)
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single notification by ID
    
    Path Parameters:
    - notification_id: The ID of the notification to retrieve
    
    Example: GET /notifications/1
    """
    notification = service.get_notification_by_id(
        db=db,
        notification_id=notification_id
    )
    
    if not notification:
        raise HTTPException(
            status_code=404,
            detail=f"Notification with id {notification_id} not found"
        )
    
    return notification


