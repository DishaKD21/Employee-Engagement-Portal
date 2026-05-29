import logging

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


@app.on_event("startup")
def startup() -> None:
    logging.basicConfig(level=logging.INFO)
    init_db()
    warm_embedding_model()
    validate_vector_configuration()
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