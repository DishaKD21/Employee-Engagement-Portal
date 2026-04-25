"""
Router for Knowledge Base endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.modules.knowledge_base import service
from app.modules.knowledge_base.schema import ArticleResponse, PaginatedResponse

router = APIRouter(
    prefix="/articles",
    tags=["knowledge_base"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=PaginatedResponse[ArticleResponse])
def list_articles(
    skip: int = 0,
    limit: int = 10,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all knowledge base articles with pagination
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records per page (default: 10)
    - category: Filter by category (optional)
    - status: Filter by status (draft/approved/published)
    
    Example: GET /articles?skip=0&limit=10&category=HR&status=published
    """
    if limit > 100:
        limit = 100
    
    articles, total = service.get_all_articles(
        db=db,
        skip=skip,
        limit=limit,
        category=category,
        status=status
    )
    
    return PaginatedResponse[ArticleResponse](
        items=articles,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(
    article_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single knowledge base article by ID
    
    Path Parameters:
    - article_id: The ID of the article to retrieve
    
    Example: GET /articles/1
    """
    article = service.get_article_by_id(db=db, article_id=article_id)
    
    if not article:
        raise HTTPException(
            status_code=404,
            detail=f"Article with id {article_id} not found"
        )
    
    return article
