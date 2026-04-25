"""
Notification model
Maps to notifications table
"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, Text, ForeignKey
from app.config.database import Base


class NotificationStatusEnum(str, Enum):
    """Status of notifications"""
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class NotificationChannelEnum(str, Enum):
    """Notification delivery channels"""
    EMAIL = "email"
    CHAT = "chat"
    INTRANET = "intranet"


class NotificationTypeEnum(str, Enum):
    """Types of notifications"""
    RECOGNITION = "recognition"
    EVENT = "event"
    SURVEY = "survey"
    QUERY_RESPONSE = "query_response"
    SYSTEM = "system"


class Notification(Base):
    """
    Notification model
    Represents notifications sent to employees
    
    Attributes:
        notification_id: Primary key
        employee_id: ID of recipient employee
        title: Notification title
        message: Notification message body
        notification_type: Type of notification
        related_id: ID of related content (event, survey, query, etc.)
        related_type: Type of related content
        channel: Delivery channel (email/chat/intranet)
        status: Current status
        retry_count: Number of delivery retries
        sent_at: Timestamp when sent
        read_at: Timestamp when read by employee
        created_at: Creation timestamp
    """
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=True, index=True)
    title = Column(String(200), nullable=True)
    message = Column(Text, nullable=True)
    notification_type = Column(
        SQLEnum(
            NotificationTypeEnum,
            name="notification_type_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=True,
    )
    related_id = Column(Integer, nullable=True)
    related_type = Column(String(50), nullable=True)
    channel = Column(
        SQLEnum(
            NotificationChannelEnum,
            name="notification_channel_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=True,
    )
    status = Column(
        SQLEnum(
            NotificationStatusEnum,
            name="notification_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=NotificationStatusEnum.PENDING,
    )
    retry_count = Column(Integer, default=0)
    sent_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
