from __future__ import annotations

import re
from typing import Iterable
from urllib import error, request
import json

from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.rag_vector import KnowledgeBaseChunk
from app.services.embedding import embed_text

 
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


def retrieve_best_chunk(db: Session, query_text: str) -> KnowledgeBaseChunk | None:
    query_embedding = embed_text(query_text)
    return (
        db.query(KnowledgeBaseChunk)
        .order_by(KnowledgeBaseChunk.embedding.cosine_distance(query_embedding))
        .first()
    )


def build_answer(query_text: str, chunk: KnowledgeBaseChunk) -> str:
    source_title = chunk.article_title or "the indexed policy"
    excerpt = chunk.chunk_text.strip().replace("\n", " ")
    if len(excerpt) > 320:
        excerpt = excerpt[:320].rsplit(" ", 1)[0] + "..."
    return f"Based on {source_title}, {excerpt}"


def generate_local_answer(query_text: str, chunk: KnowledgeBaseChunk) -> str:
    prompt = (
        "You are an enterprise HR knowledge assistant. Use only the provided policy context. "
        "If the context is insufficient, say the question should be escalated to HR.\n\n"
        f"Question: {query_text}\n"
        f"Policy context: {chunk.chunk_text}\n\n"
        "Answer in a concise, helpful paragraph."
    )

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

    try:
        with request.urlopen(ollama_request, timeout=20) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
            answer = (response_payload.get("response") or "").strip()
            if answer:
                return answer
    except (error.URLError, TimeoutError, ValueError, OSError):
        pass

    return build_answer(query_text, chunk)


def score_confidence(query_text: str, chunk: KnowledgeBaseChunk | None) -> float:
    if chunk is None:
        return 0.0

    query_terms = {token for token in re.findall(r"[a-z0-9]+", query_text.lower()) if len(token) > 2}
    chunk_terms = {token for token in re.findall(r"[a-z0-9]+", (chunk.chunk_text or "").lower()) if len(token) > 2}
    term_overlap = len(query_terms & chunk_terms) / max(len(query_terms), 1)
    semantic_score = cosine_similarity(embed_text(query_text), chunk.embedding)
    raw_score = (semantic_score * 0.8) + (term_overlap * 0.2)
    return max(0.0, min(1.0, raw_score))