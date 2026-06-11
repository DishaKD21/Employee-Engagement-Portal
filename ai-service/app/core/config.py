from dataclasses import dataclass
from os import getenv


@dataclass(frozen=True)
class Settings:
    database_url: str = getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_bt1RPUL4IXoQ@ep-rough-firefly-amhjfuv8.c-5.us-east-1.aws.neon.tech/employee-engagement?sslmode=require&channel_binding=require",
    )
    embedding_model: str = getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    vector_dimension: int = int(getenv("VECTOR_DIMENSION", "384"))
    ai_service_port: int = int(getenv("AI_SERVICE_PORT", "5000"))
    ollama_model: str = getenv("OLLAMA_MODEL", "qwen2:0.5b")
    ollama_base_url: str = getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    confidence_threshold: float = float(getenv("CONFIDENCE_THRESHOLD", "0.5"))
    max_chunks_per_article: int = int(getenv("MAX_CHUNKS_PER_ARTICLE", "16"))
    chunk_size_chars: int = int(getenv("CHUNK_SIZE_CHARS", "1200"))
    chunk_overlap_chars: int = int(getenv("CHUNK_OVERLAP_CHARS", "150"))
    ai_service_enabled: bool = getenv("AI_SERVICE_ENABLED", "true").lower() in ("true", "1", "yes")


settings = Settings()
