import logging
import json
from urllib import error, request

from fastapi import FastAPI

from app.core.config import settings
from app.db.session import init_db
from app.routes.rag import router as rag_router
from app.services.embedding import get_embedding_dimension, warm_embedding_model

app = FastAPI(title="Enterprise HR Knowledge Assistant AI Service")
logger = logging.getLogger("ai-service")


def validate_vector_configuration() -> None:
    model_dimension = get_embedding_dimension()
    if model_dimension != settings.vector_dimension:
        message = (
            f"Embedding dimension mismatch: model={model_dimension}, "
            f"configured={settings.vector_dimension}. Update VECTOR_DIMENSION or EMBEDDING_MODEL."
        )
        logger.error(message)
        raise RuntimeError(message)


def check_ollama_health() -> None:
    logger.info("OLLAMA_BASE_URL=%s", settings.ollama_base_url)
    logger.info("OLLAMA_MODEL=%s", settings.ollama_model)

    tags_request = request.Request(
        f"{settings.ollama_base_url.rstrip('/')}/api/tags",
        method="GET",
    )

    try:
        with request.urlopen(tags_request, timeout=5) as response:
            raw = response.read().decode("utf-8")
            payload = json.loads(raw)
            models = payload.get("models") if isinstance(payload, dict) else None
            model_names = [m.get("name") for m in models if isinstance(m, dict)] if isinstance(models, list) else []
            logger.info(
                "OLLAMA_HEALTH_OK | model_count=%s | configured_model_present=%s",
                len(model_names),
                settings.ollama_model in model_names,
            )
    except (error.URLError, TimeoutError, ValueError, OSError):
        logger.exception("OLLAMA_HEALTH_FAIL")


@app.on_event("startup")
def startup() -> None:
    logging.basicConfig(level=logging.INFO)
    init_db()
    warm_embedding_model()
    validate_vector_configuration()
    check_ollama_health()
    logger.info(
        "AI service started with embedding_model=%s vector_dimension=%s ollama_model=%s ollama_base_url=%s",
        settings.embedding_model,
        settings.vector_dimension,
        settings.ollama_model,
        settings.ollama_base_url,
    )


app.include_router(rag_router, prefix="/rag")


@app.get("/health")
def health():
    return {"status": "ok"}