import sys
import os
from sqlalchemy import text

# ensure ai-service root is on sys.path so `app` package imports work
root = os.path.dirname(os.path.dirname(__file__))
if root not in sys.path:
    sys.path.insert(0, root)

from app.db import session

engine = session.engine

with engine.connect() as conn:
    # ensure search_path includes ethan schema
    try:
        conn.execute(text('SET search_path TO ethan, public'))
    except Exception:
        pass

    try:
        count = conn.execute(text('SELECT COUNT(*) FROM ethan.knowledge_base_chunks')).scalar()
    except Exception as e:
        print('COUNT_ERROR', e)
        count = None

    try:
        null_count = conn.execute(text('SELECT COUNT(*) FROM ethan.knowledge_base_chunks WHERE embedding IS NULL')).scalar()
    except Exception as e:
        print('NULL_COUNT_ERROR', e)
        null_count = None

    print('TOTAL_CHUNKS:', count)
    print('NULL_EMBEDDINGS:', null_count)

    try:
        sample = conn.execute(text("SELECT id, article_id, chunk_index, substring(chunk_text for 200) as excerpt, embedding FROM ethan.knowledge_base_chunks LIMIT 5")).fetchall()
        for row in sample:
            print('ROW_ID:', row[0], 'ARTICLE_ID:', row[1], 'CHUNK_IDX:', row[2])
            excerpt = row[3]
            emb = row[4]
            print('  EXCERPT:', excerpt)
            try:
                # attempt to print embedding length or preview
                if emb is None:
                    print('  EMBEDDING: None')
                else:
                    try:
                        print('  EMBEDDING_TYPE:', type(emb), 'len_preview:', len(emb) if hasattr(emb, '__len__') else 'unknown', 'preview:', (list(emb)[:6] if hasattr(emb, '__iter__') else str(emb)[:60]))
                    except Exception:
                        print('  EMBEDDING (raw):', str(emb)[:200])
            except Exception:
                print('  EMBEDDING: <could not inspect>')
    except Exception as e:
        print('SAMPLE_ERROR', e)
