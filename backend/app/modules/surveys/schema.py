"""
Pydantic schemas for Survey endpoints
"""
from datetime import date, datetime
from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar('T')


class SurveyQuestionResponse(BaseModel):
    """Response schema for survey question"""
    question_id: int
    survey_id: int
    question_text: Optional[str] = None
    question_type: Optional[str] = None
    options: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


class SurveyResponse(BaseModel):
    """Response schema for survey"""
    survey_id: int
    title: Optional[str] = None
    target_audience: Optional[str] = None
    open_date: Optional[date] = None
    close_date: Optional[date] = None
    is_anonymous: bool = True
    created_by: Optional[int] = None
    approved_status: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SurveyResponseResponse(BaseModel):
    """Response schema for survey response"""
    response_id: int
    survey_id: int
    employee_id: int
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SurveyAnswerResponse(BaseModel):
    """Response schema for survey answer"""
    id: int
    response_id: int
    question_id: int
    answer_text: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper"""
    items: List[T]
    total: int
    skip: int
    limit: int

    model_config = ConfigDict(from_attributes=True)
