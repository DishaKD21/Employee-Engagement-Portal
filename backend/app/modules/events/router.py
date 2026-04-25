"""
Router for Event endpoints
Defines all GET endpoints for engagement events and recognition events
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.modules.events import service
from app.modules.events.schema import (
    EngagementEventResponse,
    RecognitionEventResponse,
    EventParticipantResponse,
    PaginatedResponse
)

router = APIRouter(
    prefix="/events",
    tags=["events"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=PaginatedResponse[EngagementEventResponse])
def list_engagement_events(
    skip: int = 0,
    limit: int = 10,
    status: Optional[str] = None,
    approved_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all engagement events with pagination
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)
    - status: Filter by status (draft/published/completed)
    - approved_status: Filter by approval status (pending/approved/rejected)
    
    Example: GET /events?skip=0&limit=10&status=published&approved_status=approved
    """
    if limit > 100:
        limit = 100
    
    events, total = service.get_all_engagement_events(
        db=db,
        skip=skip,
        limit=limit,
        status=status,
        approved_status=approved_status
    )
    
    return PaginatedResponse[EngagementEventResponse](
        items=events,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/recognition/events", response_model=PaginatedResponse[RecognitionEventResponse])
def list_recognition_events(
    skip: int = 0,
    limit: int = 10,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get all recognition events (birthdays, anniversaries, etc.)

    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)
    - employee_id: Filter by employee ID (optional)

    Example: GET /events/recognition/events?employee_id=1
    """
    if limit > 100:
        limit = 100

    events, total = service.get_all_recognition_events(
        db=db,
        skip=skip,
        limit=limit,
        employee_id=employee_id
    )

    return PaginatedResponse[RecognitionEventResponse](
        items=events,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/recognition/{event_id}", response_model=RecognitionEventResponse)
def get_recognition_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single recognition event by ID

    Path Parameters:
    - event_id: The ID of the recognition event

    Example: GET /events/recognition/1
    """
    event = service.get_recognition_event_by_id(db=db, event_id=event_id)

    if not event:
        raise HTTPException(
            status_code=404,
            detail=f"Recognition event with id {event_id} not found"
        )

    return event


@router.get("/{event_id}", response_model=EngagementEventResponse)
def get_engagement_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single engagement event by ID
    
    Path Parameters:
    - event_id: The ID of the event to retrieve
    
    Example: GET /events/1
    """
    event = service.get_engagement_event_by_id(db=db, event_id=event_id)
    
    if not event:
        raise HTTPException(
            status_code=404,
            detail=f"Event with id {event_id} not found"
        )
    
    return event


@router.get("/{event_id}/participants", response_model=PaginatedResponse[EventParticipantResponse])
def get_event_participants(
    event_id: int,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Get participants for a specific event
    
    Path Parameters:
    - event_id: The ID of the event
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)
    
    Example: GET /events/1/participants
    """
    if limit > 100:
        limit = 100
    
    participants, total = service.get_event_participants(
        db=db,
        event_id=event_id,
        skip=skip,
        limit=limit
    )
    
    return PaginatedResponse[EventParticipantResponse](
        items=participants,
        total=total,
        skip=skip,
        limit=limit
    )


