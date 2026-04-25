"""
Service layer for Knowledge Base module
"""
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.knowledge_model import KnowledgeBaseArticle
from app.modules.service_utils import (
    DatabaseReadError,
    clean_pagination,
    clean_string,
    raise_database_error,
)

ARTICLE_STATUSES = ("draft", "approved", "published")


def get_all_articles(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    category: Optional[str] = None,
    status: Optional[str] = None
) -> tuple[List[KnowledgeBaseArticle], int]:
    """
    Get all knowledge base articles with pagination and filtering
    
    Args:
        db: Database session
        skip: Number of records to skip
        limit: Number of records to return
        category: Filter by category
        status: Filter by status (draft/approved/published)
        
    Returns:
        Tuple of (articles list, total count)
    """
    try:
        skip, limit = clean_pagination(skip, limit)
        category = clean_string(category)
        status = clean_string(status, lowercase=True)

        if status is not None and status not in ARTICLE_STATUSES:
            allowed_text = ", ".join(ARTICLE_STATUSES)
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Allowed values: {allowed_text}",
            )

        query = db.query(KnowledgeBaseArticle)

        if category is not None:
            query = query.filter(KnowledgeBaseArticle.category == category)
        if status is not None:
            query = query.filter(KnowledgeBaseArticle.status == status)

        total = query.count()
        articles = query.offset(skip).limit(limit).all()

        return articles, total
    except HTTPException:
        raise
    except DatabaseReadError as exc:
        raise_database_error(db, exc)


def get_article_by_id(
    db: Session,
    article_id: int
) -> Optional[KnowledgeBaseArticle]:
    """
    Get a single article by ID
    
    Args:
        db: Database session
        article_id: ID of article to retrieve
        
    Returns:
        KnowledgeBaseArticle or None if not found
    """
    try:
        return db.query(KnowledgeBaseArticle).filter(
            KnowledgeBaseArticle.article_id == article_id
        ).first()
    except DatabaseReadError as exc:
        raise_database_error(db, exc)
