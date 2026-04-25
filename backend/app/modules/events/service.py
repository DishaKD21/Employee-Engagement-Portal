"""
Service layer for Events module
Contains business logic for engagement events and recognition events
"""
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.engagement_model import (
    ApprovalStatusEnum,
    EngagementEvent,
    EventParticipant,
    EventStatusEnum,
)
from app.models.recognition_model import RecognitionEvent
from app.modules.service_utils import (
    DatabaseReadError,
    clean_enum_value,
    clean_pagination,
    raise_database_error,
)


def get_all_engagement_events(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    status: Optional[str] = None,
    approved_status: Optional[str] = None
) -> tuple[List[EngagementEvent], int]:
    """
    Get all engagement events with pagination and filtering
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Number of records to return
        status: Filter by event status (draft/published/completed)
        
    Returns:
        Tuple of (events list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        status = clean_enum_value(status, EventStatusEnum, "status")
        approved_status = clean_enum_value(
            approved_status,
            ApprovalStatusEnum,
            "approved_status",
        )

        query = db.query(EngagementEvent)

        if status is not None:
            query = query.filter(EngagementEvent.status == status)
        if approved_status is not None:
            query = query.filter(EngagementEvent.approved_status == approved_status)

        total = query.count()
        events = query.offset(skip).limit(limit).all()

        return events, total
    except HTTPException:
        raise
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_engagement_event_by_id(
    db: Session,
    event_id: int
) -> Optional[EngagementEvent]:
    """
    Get a single engagement event by ID
    
    Args:
        db: Database session
        event_id: ID of event to retrieve
        
    Returns:
        EngagementEvent or None if not found
    """
    try:
        return db.query(EngagementEvent).filter(
            EngagementEvent.event_id == event_id
        ).first()
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_all_recognition_events(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    employee_id: Optional[int] = None
) -> tuple[List[RecognitionEvent], int]:
    """
    Get all recognition events with pagination and filtering
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Number of records to return
        employee_id: Filter by employee ID
        
    Returns:
        Tuple of (events list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        query = db.query(RecognitionEvent)

        if employee_id is not None:
            query = query.filter(RecognitionEvent.employee_id == employee_id)

        total = query.count()
        events = query.offset(skip).limit(limit).all()

        return events, total
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_recognition_event_by_id(
    db: Session,
    event_id: int
) -> Optional[RecognitionEvent]:
    """
    Get a single recognition event by ID
    
    Args:
        db: Database session
        event_id: ID of event to retrieve
        
    Returns:
        RecognitionEvent or None if not found
    """
    try:
        return db.query(RecognitionEvent).filter(
            RecognitionEvent.event_id == event_id
        ).first()
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_event_participants(
    db: Session,
    event_id: int,
    skip: int = 0,
    limit: int = 10
) -> tuple[List[EventParticipant], int]:
    """
    Get participants for a specific event
    
    Args:
        db: Database session
        event_id: ID of the event
        skip: Number of records to skip
        limit: Number of records to return
        
    Returns:
        Tuple of (participants list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        query = db.query(EventParticipant).filter(
            EventParticipant.event_id == event_id
        )

        total = query.count()
        participants = query.offset(skip).limit(limit).all()

        return participants, total
    except DatabaseReadError as exc:
        raise_database_error(db, exc)
