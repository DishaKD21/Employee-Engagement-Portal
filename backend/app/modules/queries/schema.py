"""
Pydantic schemas for Query endpoints
"""
from datetime import datetime
from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar('T')


class QueryLogResponse(BaseModel):
    """Response schema for query log"""
    query_id: int
    employee_id: Optional[int] = None
    query_text: Optional[str] = None
    matched_article_id: Optional[int] = None
    confidence_score: Optional[float] = None
    response_delivered: Optional[str] = None
    escalation_flag: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QueryEscalationResponse(BaseModel):
    """Response schema for query escalation"""
    id: int
    query_id: Optional[int] = None
    assigned_to: Optional[int] = None
    status: Optional[str] = None
    resolution_text: Optional[str] = None
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper"""
    items: List[T]
    total: int
    skip: int
    limit: int

    model_config = ConfigDict(from_attributes=True)
