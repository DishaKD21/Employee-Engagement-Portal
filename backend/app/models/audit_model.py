"""
Audit log model
Maps to audit_logs table
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.config.database import Base


class AuditLog(Base):
    """
    Audit log model
    Tracks all major actions in the system for compliance and audit purposes
    
    Attributes:
        log_id: Primary key
        event_type: Type of event (e.g., 'event_created', 'survey_submitted')
        employee_id: ID of employee performing action
        content_id: ID of content being acted upon
        channel: Channel through which action occurred (e.g., 'web', 'api')
        outcome: Outcome of action (e.g., 'success', 'failed')
        reviewer_decision: Decision made by reviewer if applicable
        created_at: Timestamp of action
    """
    __tablename__ = "audit_logs"

    log_id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=True)
    employee_id = Column(Integer, nullable=True)
    content_id = Column(Integer, nullable=True)
    channel = Column(String(50), nullable=True)
    outcome = Column(String(100), nullable=True)
    reviewer_decision = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
