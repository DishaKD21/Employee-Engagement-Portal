"""
Approval model
Maps to approvals table
"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, Text
from app.config.database import Base


class ContentTypeEnum(str, Enum):
    """Types of content that require approval"""
    EVENT = "event"
    SURVEY = "survey"
    ARTICLE = "article"
    TEMPLATE = "template"


class ApprovalStatusEnum(str, Enum):
    """Approval status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Approval(Base):
    """
    Approval model
    Tracks approvals for various content (events, surveys, articles, templates)
    
    Attributes:
        approval_id: Primary key
        content_type: Type of content requiring approval
        content_id: ID of the content
        status: Current approval status
        reviewer_id: Employee ID of reviewer
        comments: Reviewer comments
        created_at: Approval record creation timestamp
    """
    __tablename__ = "approvals"

    approval_id = Column(Integer, primary_key=True, index=True)
    content_type = Column(
        SQLEnum(
            ContentTypeEnum,
            name="content_type_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=True,
    )
    content_id = Column(Integer, nullable=True)
    status = Column(
        SQLEnum(
            ApprovalStatusEnum,
            name="approval_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=ApprovalStatusEnum.PENDING,
    )
    reviewer_id = Column(Integer, nullable=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
