"""
Knowledge base models
Maps to knowledge_base_articles, query_logs, and query_escalations tables
"""
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, Enum as SQLEnum, Text, Float, ForeignKey
from app.config.database import Base


class QueryStatusEnum(str, Enum):
    """Status of query escalations"""
    OPEN = "open"
    RESOLVED = "resolved"


class KnowledgeBaseArticle(Base):
    """
    Knowledge base article model
    Represents FAQ/knowledge base articles
    
    Attributes:
        article_id: Primary key
        title: Article title
        content: Article content/body
        category: Category for organization
        role_tag: Role tags for targeting
        author: Employee ID of author
        version: Version number
        status: Publishing status (draft/approved/published)
        last_reviewed_date: Date of last review
        created_at: Creation timestamp
    """
    __tablename__ = "knowledge_base_articles"

    article_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    role_tag = Column(String(100), nullable=True)
    author = Column(Integer, nullable=True)
    version = Column(Integer, nullable=True)
    status = Column(String(50), nullable=True)  # draft/approved/published
    last_reviewed_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class QueryLog(Base):
    """
    Query log model
    Tracks employee queries to the knowledge base system
    
    Attributes:
        query_id: Primary key
        employee_id: ID of employee making query
        query_text: The query text
        matched_article_id: ID of matched knowledge base article
        confidence_score: Confidence score of match (0-1)
        response_delivered: The response delivered to employee
        escalation_flag: Whether query was escalated
        created_at: Query timestamp
    """
    __tablename__ = "query_logs"

    query_id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.employee_id"), nullable=True, index=True)
    query_text = Column(Text, nullable=True)
    matched_article_id = Column(Integer, ForeignKey("knowledge_base_articles.article_id"), nullable=True)
    confidence_score = Column(Float, nullable=True)
    response_delivered = Column(Text, nullable=True)
    escalation_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class QueryEscalation(Base):
    """
    Query escalation model
    Tracks escalated queries that need human intervention
    
    Attributes:
        id: Primary key
        query_id: ID of query being escalated
        assigned_to: Employee ID of assignee/handler
        status: Escalation status (open/resolved)
        resolution_text: Resolution/response text
        resolved_at: When escalation was resolved
    """
    __tablename__ = "query_escalations"

    id = Column(Integer, primary_key=True, index=True)
    query_id = Column(Integer, ForeignKey("query_logs.query_id", ondelete="CASCADE"), nullable=True, index=True)
    assigned_to = Column(Integer, nullable=True)
    status = Column(
        SQLEnum(
            QueryStatusEnum,
            name="query_status_enum",
            values_callable=lambda obj: [e.value for e in obj],
        ),
        default=QueryStatusEnum.OPEN,
    )
    resolution_text = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
