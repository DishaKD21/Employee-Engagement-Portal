from app.db.session import SessionLocal
from app.models.rag_vector import KnowledgeBaseChunk

db = SessionLocal()

chunk = db.query(KnowledgeBaseChunk).first()

print("TYPE:", type(chunk.embedding))

if chunk:
    print(chunk.embedding[:5])

db.close()
