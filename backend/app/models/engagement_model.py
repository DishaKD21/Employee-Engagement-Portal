"""
Engagement event models
Maps to engagement_events and event_participants tables
"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Enum as SQLEnum, Text, Float, ForeignKey, UniqueConstraint
from app.config.database import Base


class EventStatusEnum(str, Enum):
    """Status of engagement events"""
    DRAFT = "draft"
    PUBLISHED = "published"
    COMPLETED = "completed"


class ParticipationStatusEnum(str, Enum):
    """Participation status in events"""
    REGISTERED = "registered"
    PARTICIPATED = "participated"
    ABSENT = "absent"


class ApprovalStatusEnum(str, Enum):
    """Approval status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class EngagementEvent(Base):
    """
    Engagement event model
    Represents HR/engagement activities and events
    
    Attributes:
        event_id: Primary key
        event_name: Name of the event
        event_type: Type of event
        description: Event description
        target_audience: Target audience for the event
        registration_start: Start date for registration
        registration_end: End date for registration
        event_date: Date when event occurs
        published_date: Date event was published
        status: Current status of event
        created_by: Employee ID of creator
        approved_status: Approval status
    """
    __tablename__ = "engagement_events"

    event_id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(150), nullable=True)
    event_type = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    target_audience = Column(String(100), nullable=True)
    registration_start = Column(Date, nullable=True)
    registration_end = Column(Date, nullable=True)
    event_date = Column(Date, nullable=True)
    published_date = Column(Date, nullable=True)
    status = Column(
        SQLEnum(
            EventStatusEnum,
            name="event_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=EventStatusEnum.DRAFT,
    )
    created_by = Column(Integer, nullable=True)
    approved_status = Column(
        SQLEnum(
            ApprovalStatusEnum,
            name="approval_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=ApprovalStatusEnum.PENDING,
    )


class EventParticipant(Base):
    """
    Event participant model
    Tracks employee participation in engagement events
    
    Attributes:
        id: Primary key
        event_id: ID of the event
        employee_id: ID of the employee
        registration_status: Whether employee is registered
        participation_status: Status of participation
        feedback_rating: Rating given by employee (1-5)
        feedback_text: Textual feedback
        created_at: Registration timestamp
    """
    __tablename__ = "event_participants"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("engagement_events.event_id", ondelete="CASCADE"), nullable=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=True, index=True)
    registration_status = Column(Boolean, default=False)
    participation_status = Column(
        SQLEnum(
            ParticipationStatusEnum,
            name="participation_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=True,
    )
    feedback_rating = Column(Float, nullable=True)
    feedback_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Prevent duplicate registration of same employee to same event
    __table_args__ = (UniqueConstraint('event_id', 'employee_id', name='uq_event_employee'),)
