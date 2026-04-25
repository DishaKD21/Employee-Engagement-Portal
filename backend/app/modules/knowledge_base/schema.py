"""
Pydantic schemas for Knowledge Base endpoints
"""
from datetime import date, datetime
from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar('T')


class ArticleResponse(BaseModel):
    """Response schema for knowledge base article"""
    article_id: int
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    role_tag: Optional[str] = None
    author: Optional[int] = None
    version: Optional[int] = None
    status: Optional[str] = None
    last_reviewed_date: Optional[date] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper"""
    items: List[T]
    total: int
    skip: int
    limit: int

    model_config = ConfigDict(from_attributes=True)
