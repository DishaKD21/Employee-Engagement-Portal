"""
Recognition models
Maps to recognition_templates, recognition_events, and recognition_delivery_logs tables
"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Enum as SQLEnum, Text, ForeignKey
from app.config.database import Base


class EventTypeEnum(str, Enum):
    """Recognition event types"""
    BIRTHDAY = "birthday"
    ANNIVERSARY = "anniversary"
    OTHER = "other"


class ApprovalStatusEnum(str, Enum):
    """Approval status for templates"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class DeliveryStatusEnum(str, Enum):
    """Delivery status for recognition events"""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class NotificationChannelEnum(str, Enum):
    """Notification delivery channels"""
    EMAIL = "email"
    CHAT = "chat"
    INTRANET = "intranet"


class RecognitionTemplate(Base):
    """
    Recognition template model
    Defines templates for recognition events (birthday, anniversary, etc.)
    
    Attributes:
        template_id: Primary key
        template_name: Name of the template
        event_type: Type of recognition event (birthday/anniversary/other)
        content: Template content/message
        version: Version number of template
        is_active: Whether template is active
        created_by: Employee ID of creator
        approved_status: Approval status
        created_at: Creation timestamp
    """
    __tablename__ = "recognition_templates"

    template_id = Column(Integer, primary_key=True, index=True)
    template_name = Column(String(100), nullable=True)
    event_type = Column(
        SQLEnum(
            EventTypeEnum,
            name="event_type_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=True,
    )
    content = Column(Text, nullable=True)
    version = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, nullable=True)
    approved_status = Column(
        SQLEnum(
            ApprovalStatusEnum,
            name="approval_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=ApprovalStatusEnum.PENDING,
    )
    created_at = Column(DateTime, default=datetime.utcnow)


class RecognitionEvent(Base):
    """
    Recognition event model
    Represents an actual recognition event triggered for an employee
    
    Attributes:
        event_id: Primary key
        employee_id: ID of employee being recognized
        event_type: Type of recognition event
        trigger_date: Date when event was triggered
        template_id: ID of template used
        delivery_status: Status of delivery
        created_at: Creation timestamp
    """
    __tablename__ = "recognition_events"

    event_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=True, index=True)
    event_type = Column(
        SQLEnum(
            EventTypeEnum,
            name="event_type_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=True,
    )
    trigger_date = Column(Date, nullable=True)
    template_id = Column(Integer, ForeignKey("recognition_templates.template_id"), nullable=True)
    delivery_status = Column(
        SQLEnum(
            DeliveryStatusEnum,
            name="delivery_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=DeliveryStatusEnum.PENDING,
    )
    created_at = Column(DateTime, default=datetime.utcnow)


class RecognitionDeliveryLog(Base):
    """
    Recognition delivery log model
    Tracks delivery attempts for recognition events across different channels
    
    Attributes:
        id: Primary key
        event_id: ID of recognition event
        channel: Channel through which event was/will be delivered
        delivery_status: Current delivery status
        retry_count: Number of delivery retry attempts
        delivered_at: Timestamp when successfully delivered
    """
    __tablename__ = "recognition_delivery_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("recognition_events.event_id", ondelete="CASCADE"), nullable=True, index=True)
    channel = Column(
        SQLEnum(
            NotificationChannelEnum,
            name="notification_channel_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=True,
    )
    delivery_status = Column(
        SQLEnum(
            DeliveryStatusEnum,
            name="delivery_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=True,
    )
    retry_count = Column(Integer, default=0)
    delivered_at = Column(DateTime, nullable=True)
