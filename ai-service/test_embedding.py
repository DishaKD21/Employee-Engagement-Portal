from app.services.embedding import embed_text

query_embedding = embed_text("hello")

print("TYPE:", type(query_embedding))
print("LEN:", len(query_embedding))
print("FIRST 5:", query_embedding[:5])
