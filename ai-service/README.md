# AI Service

FastAPI RAG service for the Enterprise HR Knowledge Assistant.

## Local stack

- Embeddings: `sentence-transformers/all-MiniLM-L6-v2`
- Vector store: PostgreSQL with `pgvector`
- LLM: local `Ollama`

## Environment variables

Configure `.env` directly:

- `DATABASE_URL` - PostgreSQL connection string
- `EMBEDDING_MODEL` - sentence-transformers model name
- `VECTOR_DIMENSION` - embedding dimension, must match the model output
- `AI_SERVICE_PORT` - FastAPI port
- `OLLAMA_MODEL` - local Ollama model name, for example `phi3:mini`, `mistral`, or `llama3`
- `OLLAMA_BASE_URL` - Ollama base URL, usually `http://localhost:11434`

## Setup

1. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Make sure PostgreSQL has `pgvector` installed and the target database exists.
3. Make sure Ollama is running locally and the model is pulled, for example:

   ```bash
   ollama pull phi3:mini
   ollama serve
   ```

4. Start the service:

   ```bash
   run.bat
   ```

## Smoke test

With the service running, execute the local end-to-end smoke test:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

The script checks `/health`, indexes a sample leave policy article, and verifies `/rag/query` returns a non-escalated local answer.

## Startup validation

On startup the service validates that the configured `VECTOR_DIMENSION` matches the loaded embedding model dimension. If they differ, startup fails with a clear error log.

## Endpoints

- `GET /health` - returns `{ "status": "ok" }`
- `POST /rag/index-article`
- `POST /rag/query`

## pgvector setup

The service creates its own `knowledge_base_chunks` table on startup. Ensure the PostgreSQL database has the `vector` extension available.

Example:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```