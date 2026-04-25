"""
Pydantic schemas for Event endpoints
"""
from datetime import date, datetime
from typing import List, Optional, Generic, TypeVar
from enum import Enum
from pydantic import BaseModel, ConfigDict

T = TypeVar('T')


class EventStatusEnum(str, Enum):
    """Status of events"""
    DRAFT = "draft"
    PUBLISHED = "published"
    COMPLETED = "completed"


class EngagementEventResponse(BaseModel):
    """Response schema for engagement event"""
    event_id: int
    event_name: Optional[str] = None
    event_type: Optional[str] = None
    description: Optional[str] = None
    target_audience: Optional[str] = None
    registration_start: Optional[date] = None
    registration_end: Optional[date] = None
    event_date: Optional[date] = None
    published_date: Optional[date] = None
    status: Optional[str] = None
    created_by: Optional[int] = None
    approved_status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EventParticipantResponse(BaseModel):
    """Response schema for event participant"""
    id: int
    event_id: int
    employee_id: int
    registration_status: bool
    participation_status: Optional[str] = None
    feedback_rating: Optional[float] = None
    feedback_text: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecognitionEventResponse(BaseModel):
    """Response schema for recognition event"""
    event_id: int
    employee_id: Optional[int] = None
    event_type: Optional[str] = None
    trigger_date: Optional[date] = None
    template_id: Optional[int] = None
    delivery_status: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper"""
    items: List[T]
    total: int
    skip: int
    limit: int

    model_config = ConfigDict(from_attributes=True)
