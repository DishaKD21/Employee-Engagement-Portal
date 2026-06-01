from __future__ import annotations

import json
import logging
import re
from typing import Iterable
from urllib import error, request

from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.rag_vector import KnowledgeBaseChunk
from app.services.embedding import embed_text

logger = logging.getLogger("ai-service")

 
def split_text_into_chunks(text: str) -> list[str]:
    cleaned_text = re.sub(r"\r\n", "\n", text or "").strip()
    if not cleaned_text:
        return []

    paragraphs = [part.strip() for part in re.split(r"\n\s*\n", cleaned_text) if part.strip()]
    chunks: list[str] = []

    for paragraph in paragraphs or [cleaned_text]:
        if len(paragraph) <= settings.chunk_size_chars:
            chunks.append(paragraph)
            continue

        start = 0
        while start < len(paragraph):
            end = min(len(paragraph), start + settings.chunk_size_chars)
            chunks.append(paragraph[start:end].strip())
            if end >= len(paragraph):
                break
            start = max(0, end - settings.chunk_overlap_chars)

    return chunks[: settings.max_chunks_per_article]


def delete_existing_chunks(db: Session, article_id: int) -> None:
    db.execute(delete(KnowledgeBaseChunk).where(KnowledgeBaseChunk.article_id == article_id))


def index_article(
    db: Session,
    *,
    article_id: int,
    title: str | None,
    content: str | None,
    category: str | None,
    role_tag: str | None,
    version: int | None,
    status: str | None,
) -> int:
    chunks = split_text_into_chunks(content or "")
    delete_existing_chunks(db, article_id)

    if not chunks:
        db.commit()
        return 0

    embeddings = [embed_text(chunk) for chunk in chunks]
    for index, (chunk_text, embedding) in enumerate(zip(chunks, embeddings, strict=False)):
        db.add(
            KnowledgeBaseChunk(
                article_id=article_id,
                article_title=title,
                chunk_index=index,
                chunk_text=chunk_text,
                category=category,
                role_tag=role_tag,
                version=version,
                source_status=status,
                embedding=embedding,
            )
        )

    db.commit()
    return len(chunks)


def cosine_similarity(a: Iterable[float], b: Iterable[float]) -> float:
    a_list = list(a)
    b_list = list(b)
    dot = sum(x * y for x, y in zip(a_list, b_list, strict=False))
    a_norm = sum(x * x for x in a_list) ** 0.5
    b_norm = sum(y * y for y in b_list) ** 0.5
    if not a_norm or not b_norm:
        return 0.0
    return dot / (a_norm * b_norm)


def retrieve_best_chunk(db: Session, query_text: str, top_k: int = 5) -> KnowledgeBaseChunk | None:
    query_embedding = embed_text(query_text)

    try:
        # fetch top_k candidate chunks by vector distance
        candidates = (
            db.query(KnowledgeBaseChunk)
            .order_by(KnowledgeBaseChunk.embedding.cosine_distance(query_embedding))
            .limit(top_k)
            .all()
        )
    except Exception:
        logger.exception("Failed to retrieve candidate chunks from DB")
        candidates = []

    # Log query embedding summary (first 6 values and length)
    try:
        embedding_preview = query_embedding[:6] if hasattr(query_embedding, "__iter__") else None
        logger.info(
            "RAG: query embedding generated | query=%r | embedding_dim=%s | embedding_preview=%s",
            query_text,
            len(query_embedding),
            embedding_preview,
        )
    except Exception:
        logger.debug("RAG: failed to log query embedding preview")

    # compute similarity scores for logging
    similarities: list[tuple[int, float]] = []
    for c in candidates:
        try:
            score = cosine_similarity(query_embedding, c.embedding)
        except Exception:
            score = 0.0
        similarities.append((c.id, score))

    top_chunk_text = candidates[0].chunk_text[:320] if candidates and candidates[0].chunk_text else None
    logger.info(
        "RAG: retrieved candidate chunks | query=%r | candidate_count=%s | similarities=%s | top_chunk_ids=%s | top_chunk_text=%r",
        query_text,
        len(candidates),
        similarities,
        [c.id for c in candidates],
        top_chunk_text,
    )

    return candidates[0] if candidates else None


def build_answer(query_text: str, chunk: KnowledgeBaseChunk) -> str:
    source_title = chunk.article_title or "the indexed policy"
    excerpt = chunk.chunk_text.strip().replace("\n", " ")
    if len(excerpt) > 320:
        excerpt = excerpt[:320].rsplit(" ", 1)[0] + "..."
    return f"Based on {source_title}, {excerpt}"


def call_ollama(prompt: str) -> str | None:
    payload = json.dumps({
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
    }).encode("utf-8")

    ollama_request = request.Request(
        f"{settings.ollama_base_url.rstrip('/')}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    logger.info(
        "BEFORE_OLLAMA_CALL | model=%s | base_url=%s | prompt_length=%s",
        settings.ollama_model,
        settings.ollama_base_url,
        len(prompt),
    )

    try:
        with request.urlopen(ollama_request, timeout=20) as response:
            raw = response.read().decode("utf-8")
            try:
                response_payload = json.loads(raw)
            except Exception:
                logger.error("OLLAMA_EXCEPTION | invalid_json_response")
                return None

            answer = (response_payload.get("response") or "").strip()
            logger.info(
                "AFTER_OLLAMA_CALL | model=%s | has_answer=%s | response_preview=%r",
                settings.ollama_model,
                bool(answer),
                (answer[:320] + "...") if len(answer) > 320 else answer,
            )
            return answer or None
    except (error.URLError, TimeoutError, ValueError, OSError):
        logger.exception("OLLAMA_EXCEPTION | request_failed")
        return None


def generate_answer(query_text: str, chunk: KnowledgeBaseChunk) -> str:
    prompt = (
        "You are an enterprise HR knowledge assistant. Use only the provided policy context. "
        "If the context is insufficient, say the question should be escalated to HR.\n\n"
        f"Question: {query_text}\n"
        f"Policy context: {chunk.chunk_text}\n\n"
        "Answer in a concise, helpful paragraph."
    )

    answer = call_ollama(prompt)
    if answer:
        return answer

    return build_answer(query_text, chunk)


def generate_local_answer(query_text: str, chunk: KnowledgeBaseChunk) -> str:
    return generate_answer(query_text, chunk)


def score_confidence(query_text: str, chunk: KnowledgeBaseChunk | None) -> float:
    if chunk is None:
        return 0.0

    query_terms = {token for token in re.findall(r"[a-z0-9]+", query_text.lower()) if len(token) > 2}
    chunk_terms = {token for token in re.findall(r"[a-z0-9]+", (chunk.chunk_text or "").lower()) if len(token) > 2}
    term_overlap = len(query_terms & chunk_terms) / max(len(query_terms), 1)
    # compute semantic similarity using the same embedding call as retrieval
    query_embedding = embed_text(query_text)
    semantic_score = cosine_similarity(query_embedding, chunk.embedding)
    raw_score = (semantic_score * 0.8) + (term_overlap * 0.2)

    final_score = max(0.0, min(1.0, raw_score))

    # Log scoring details for debugging
    try:
        logger.info(
            "RAG: scoring confidence | query=%r | term_overlap=%s | semantic_score=%s | raw_score=%s | final_confidence=%s",
            query_text,
            term_overlap,
            semantic_score,
            raw_score,
            final_score,
        )
    except Exception:
        logger.debug("RAG: failed to log scoring details")

    return final_score