from sqlalchemy import text
import os
# load .env
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
with open(env_path) as f:
    for line in f:
        if not line.strip() or line.strip().startswith('#'):
            continue
        k,v=line.split('=',1)
        os.environ.setdefault(k,v)

# Ensure package import path
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import engine

print('Using DB URL:', os.environ.get('DATABASE_URL'))
with engine.connect() as conn:
    conn.execute(text('CREATE EXTENSION IF NOT EXISTS vector'))
    res = conn.execute(text("SELECT extname FROM pg_extension"))
    exts = [row[0] for row in res.fetchall()]
    print('extensions:', exts)
print('done')
