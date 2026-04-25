"""
Pydantic schemas for Notification endpoints
"""
from datetime import datetime
from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar('T')


class NotificationResponse(BaseModel):
    """Response schema for notification"""
    notification_id: int
    employee_id: int
    title: Optional[str] = None
    message: Optional[str] = None
    notification_type: Optional[str] = None
    related_id: Optional[int] = None
    related_type: Optional[str] = None
    channel: Optional[str] = None
    status: Optional[str] = None
    retry_count: int = 0
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper"""
    items: List[T]
    total: int
    skip: int
    limit: int

    model_config = ConfigDict(from_attributes=True)
