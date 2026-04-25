"""
Pydantic schemas for Audit Log endpoints
"""
from datetime import datetime
from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar('T')


class AuditLogResponse(BaseModel):
    """Response schema for audit log"""
    log_id: int
    event_type: Optional[str] = None
    employee_id: Optional[int] = None
    content_id: Optional[int] = None
    channel: Optional[str] = None
    outcome: Optional[str] = None
    reviewer_decision: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper"""
    items: List[T]
    total: int
    skip: int
    limit: int

    model_config = ConfigDict(from_attributes=True)
