"""
Pydantic schemas for Employee endpoints
Used for request/response serialization
"""
from datetime import date, datetime
from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar('T')


class EmployeeResponse(BaseModel):
    """Response schema for a single employee"""
    employee_id: int
    name: str
    email: str
    date_of_birth: date
    joining_date: date
    department: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    language: Optional[str] = None
    time_zone: Optional[str] = None
    created_at: datetime

    # Configure Pydantic to work with SQLAlchemy models
    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper"""
    items: List[T]
    total: int
    skip: int
    limit: int

    model_config = ConfigDict(from_attributes=True)
