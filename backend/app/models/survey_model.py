"""
Survey models
Maps to surveys, survey_questions, survey_responses, and survey_answers tables
"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Enum as SQLEnum, Text, JSON, ForeignKey, CheckConstraint
from app.config.database import Base


class ApprovalStatusEnum(str, Enum):
    """Approval status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class QuestionTypeEnum(str, Enum):
    """Types of survey questions"""
    MCQ = "mcq"
    RATING = "rating"
    TEXT = "text"


class Survey(Base):
    """
    Survey model
    Represents a survey for collecting employee feedback
    
    Attributes:
        survey_id: Primary key
        title: Survey title
        target_audience: Target audience for survey
        open_date: Date when survey opens
        close_date: Date when survey closes
        is_anonymous: Whether responses are anonymous
        created_by: Employee ID of creator
        approved_status: Approval status
        created_at: Creation timestamp
    """
    __tablename__ = "surveys"

    survey_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=True)
    target_audience = Column(String(100), nullable=True)
    open_date = Column(Date, nullable=True)
    close_date = Column(Date, nullable=True)
    is_anonymous = Column(Boolean, default=True)
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

    # Validation: open_date must be <= close_date
    __table_args__ = (CheckConstraint('open_date <= close_date'),)


class SurveyQuestion(Base):
    """
    Survey question model
    Represents a single question in a survey
    
    Attributes:
        question_id: Primary key
        survey_id: ID of survey this question belongs to
        question_text: The question text
        question_type: Type of question (mcq/rating/text)
        options: JSON array of options for MCQ questions
    """
    __tablename__ = "survey_questions"

    question_id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.survey_id", ondelete="CASCADE"), nullable=True, index=True)
    question_text = Column(Text, nullable=True)
    question_type = Column(
        SQLEnum(
            QuestionTypeEnum,
            values_callable=lambda obj: [e.value for e in obj],
            native_enum=False,
            length=50,
        ),
        nullable=True,
    )
    options = Column(JSON, nullable=True)


class SurveyResponse(Base):
    """
    Survey response model
    Represents an employee's response to a survey
    
    Attributes:
        response_id: Primary key
        survey_id: ID of survey
        employee_id: ID of employee responding
        submitted_at: When response was submitted
    """
    __tablename__ = "survey_responses"

    response_id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey("surveys.survey_id", ondelete="CASCADE"), nullable=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=True, index=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)


class SurveyAnswer(Base):
    """
    Survey answer model
    Represents an answer to a specific survey question
    
    Attributes:
        id: Primary key
        response_id: ID of survey response
        question_id: ID of survey question
        answer_text: The answer text/value
    """
    __tablename__ = "survey_answers"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(Integer, ForeignKey("survey_responses.response_id", ondelete="CASCADE"), nullable=True, index=True)
    question_id = Column(Integer, ForeignKey("survey_questions.question_id"), nullable=True)
    answer_text = Column(Text, nullable=True)
