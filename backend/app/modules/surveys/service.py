"""
Service layer for Surveys module
"""
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.survey_model import ApprovalStatusEnum, Survey, SurveyQuestion, SurveyResponse
from app.modules.service_utils import (
    DatabaseReadError,
    clean_enum_value,
    clean_pagination,
    raise_database_error,
)


def get_all_surveys(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    approved_status: Optional[str] = None
) -> tuple[List[Survey], int]:
    """
    Get all surveys with pagination
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Number of records to return
        approved_status: Filter by approval status
        
    Returns:
        Tuple of (surveys list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        approved_status = clean_enum_value(
            approved_status,
            ApprovalStatusEnum,
            "approved_status",
        )

        query = db.query(Survey)

        if approved_status is not None:
            query = query.filter(Survey.approved_status == approved_status)

        total = query.count()
        surveys = query.offset(skip).limit(limit).all()

        return surveys, total
    except HTTPException:
        raise
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_survey_by_id(db: Session, survey_id: int) -> Optional[Survey]:
    """
    Get a single survey by ID
    
    Args:
        db: Database session
        survey_id: ID of survey to retrieve
        
    Returns:
        Survey or None if not found
    """
    try:
        return db.query(Survey).filter(Survey.survey_id == survey_id).first()
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_survey_questions(
    db: Session,
    survey_id: int,
    skip: int = 0,
    limit: int = 10
) -> tuple[List[SurveyQuestion], int]:
    """
    Get questions for a specific survey
    
    Args:
        db: Database session
        survey_id: ID of the survey
        skip: Number of records to skip
        limit: Number of records to return
        
    Returns:
        Tuple of (questions list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        query = db.query(SurveyQuestion).filter(SurveyQuestion.survey_id == survey_id)

        total = query.count()
        questions = query.offset(skip).limit(limit).all()

        return questions, total
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_survey_responses(
    db: Session,
    survey_id: int,
    skip: int = 0,
    limit: int = 10
) -> tuple[List[SurveyResponse], int]:
    """
    Get responses for a specific survey
    
    Args:
        db: Database session
        survey_id: ID of the survey
        skip: Number of records to skip
        limit: Number of records to return
        
    Returns:
        Tuple of (responses list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        query = db.query(SurveyResponse).filter(SurveyResponse.survey_id == survey_id)

        total = query.count()
        responses = query.offset(skip).limit(limit).all()

        return responses, total
    except DatabaseReadError as exc:
        raise_database_error(db, exc)
