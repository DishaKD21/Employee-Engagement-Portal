from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

from app.core.config import settings


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer(settings.embedding_model)


def warm_embedding_model() -> None:
    get_embedding_model()


def get_embedding_dimension() -> int:
    return int(get_embedding_model().get_sentence_embedding_dimension())


def embed_text(text: str) -> list[float]:
    vector = get_embedding_model().encode(text, normalize_embeddings=True)
    array = np.asarray(vector, dtype=np.float32)
    return array.tolist()