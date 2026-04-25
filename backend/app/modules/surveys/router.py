"""
Router for Survey endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.modules.surveys import service
from app.modules.surveys.schema import (
    SurveyResponse,
    SurveyQuestionResponse,
    SurveyResponseResponse,
    PaginatedResponse
)

router = APIRouter(
    prefix="/surveys",
    tags=["surveys"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=PaginatedResponse[SurveyResponse])
def list_surveys(
    skip: int = 0,
    limit: int = 10,
    approved_status: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all surveys with pagination
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)
    - approved_status: Filter by approval status (pending/approved/rejected)
    - status: Backward-compatible alias for approved_status
    
    Example: GET /surveys?skip=0&limit=10&approved_status=approved
    """
    if limit > 100:
        limit = 100
    
    surveys, total = service.get_all_surveys(
        db=db,
        skip=skip,
        limit=limit,
        approved_status=approved_status or status
    )
    
    return PaginatedResponse[SurveyResponse](
        items=surveys,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/{survey_id}", response_model=SurveyResponse)
def get_survey(
    survey_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single survey by ID
    
    Path Parameters:
    - survey_id: The ID of the survey to retrieve
    
    Example: GET /surveys/1
    """
    survey = service.get_survey_by_id(db=db, survey_id=survey_id)
    
    if not survey:
        raise HTTPException(
            status_code=404,
            detail=f"Survey with id {survey_id} not found"
        )
    
    return survey


@router.get("/{survey_id}/questions", response_model=PaginatedResponse[SurveyQuestionResponse])
def get_survey_questions(
    survey_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get questions for a specific survey
    
    Path Parameters:
    - survey_id: The ID of the survey
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)
    
    Example: GET /surveys/1/questions
    """
    if limit > 100:
        limit = 100
    
    questions, total = service.get_survey_questions(
        db=db,
        survey_id=survey_id,
        skip=skip,
        limit=limit
    )
    
    return PaginatedResponse[SurveyQuestionResponse](
        items=questions,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/{survey_id}/responses", response_model=PaginatedResponse[SurveyResponseResponse])
def get_survey_responses(
    survey_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get responses for a specific survey
    
    Path Parameters:
    - survey_id: The ID of the survey
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)
    
    Example: GET /surveys/1/responses
    """
    if limit > 100:
        limit = 100
    
    responses, total = service.get_survey_responses(
        db=db,
        survey_id=survey_id,
        skip=skip,
        limit=limit
    )
    
    return PaginatedResponse[SurveyResponseResponse](
        items=responses,
        total=total,
        skip=skip,
        limit=limit
    )
