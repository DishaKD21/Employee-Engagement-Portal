from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.db.session import get_db
from app.schemas.rag import IndexArticleRequest, IndexArticleResponse, QueryRequest, QueryResponse
from app.services.embedding import get_embedding_dimension
from app.services.rag import generate_answer, index_article, retrieve_best_chunk, score_confidence

router = APIRouter()
logger = logging.getLogger("ai-service")


@router.post("/index-article", response_model=IndexArticleResponse)
def index_article_route(payload: IndexArticleRequest, db: Session = Depends(get_db)):
    logger.info(
        "Index article request received",
        extra={"article_id": payload.article_id, "version": payload.version, "category": payload.category, "role_tag": payload.role_tag},
    )
    chunk_count = index_article(
        db,
        article_id=payload.article_id,
        title=payload.title,
        content=payload.content,
        category=payload.category,
        role_tag=payload.role_tag,
        version=payload.version,
        status=payload.status,
    )

    logger.info("Index article request completed", extra={"article_id": payload.article_id, "chunk_count": chunk_count})

    return IndexArticleResponse(indexed=True, articleId=payload.article_id, status="indexed", chunkCount=chunk_count)


@router.post("/query", response_model=QueryResponse)
def query_route(payload: QueryRequest, db: Session = Depends(get_db)):
    logger.info("RAG query request received | query=%r", payload.query_text)
    best_chunk = retrieve_best_chunk(db, payload.query_text)

    if best_chunk is None:
        logger.info("RAG query returned no chunk match | query=%r", payload.query_text)
        return QueryResponse(answer=None, confidence=0.0, matched_article_id=None, escalate=True)

    logger.info(
        "BEFORE_CONFIDENCE_CHECK | query=%r | article_id=%s | threshold=%s",
        payload.query_text,
        best_chunk.article_id,
        settings.confidence_threshold,
    )
    confidence = score_confidence(payload.query_text, best_chunk)
    logger.info(
        "RAG query confidence computed | query=%r | final_confidence=%s | article_id=%s",
        payload.query_text,
        confidence,
        best_chunk.article_id,
    )
    logger.info(
        "AFTER_CONFIDENCE_CHECK | query=%r | confidence=%s | threshold=%s | pass=%s",
        payload.query_text,
        confidence,
        settings.confidence_threshold,
        confidence >= settings.confidence_threshold,
    )

    if confidence < settings.confidence_threshold:
        logger.info(
            "RAG query confidence below threshold | query=%r | confidence=%s | threshold=%s | article_id=%s",
            payload.query_text,
            confidence,
            settings.confidence_threshold,
            best_chunk.article_id,
        )
        logger.info(
            "RAG: Ollama skipped due confidence threshold | query=%r | confidence=%s | threshold=%s",
            payload.query_text,
            confidence,
            settings.confidence_threshold,
        )
        return QueryResponse(answer=None, confidence=confidence, matched_article_id=None, escalate=True)

    logger.info(
        "BEFORE_OLLAMA | query=%r | confidence=%s | article_id=%s",
        payload.query_text,
        confidence,
        best_chunk.article_id,
    )
    answer = generate_answer(payload.query_text, best_chunk)
    logger.info(
        "AFTER_OLLAMA | query=%r | has_answer=%s",
        payload.query_text,
        bool(answer),
    )

    response = QueryResponse(
        answer=answer,
        confidence=confidence,
        matched_article_id=best_chunk.article_id,
        escalate=False,
    )

    logger.info(
        "RAG query completed | query=%r | confidence=%s | article_id=%s",
        payload.query_text,
        confidence,
        best_chunk.article_id,
    )

    return response