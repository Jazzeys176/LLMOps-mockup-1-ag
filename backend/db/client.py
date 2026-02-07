import duckdb
import os
from pathlib import Path
from contextlib import contextmanager

# Define the path to the database file
# Assuming client.py is in backend/db/ and analytics.db is in backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = BASE_DIR / "backend" / "analytics.db"

@contextmanager
def get_db_connection():
    """
    Context manager to yield a DuckDB connection and ensure it closes.
    """
    conn = duckdb.connect(str(DB_PATH))
    try:
        yield conn
    finally:
        conn.close()

def query_db_df(query: str, params: tuple = ()):
    """
    Executes a query and returns the result as a DataFrame.
    """
    with get_db_connection() as conn:
        return conn.execute(query, params).df()

def query_db_dict(query: str, params: tuple = ()):
    """
    Executes a query and returns the result as a list of dictionaries.
    """
    with get_db_connection() as conn:
        # fetchall() returns a list of tuples
        # We need to map them to column names
        cursor = conn.execute(query, params)
        if cursor.description is None: return [] # Handle queries with no result likely insert
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        result = []
        for row in rows:
            result.append(dict(zip(columns, row)))
        return result

def execute_query(query: str, params: tuple = ()):
    """
    Executes a query (INSERT, UPDATE, DELETE) and commits.
    """
    with get_db_connection() as conn:
        conn.execute(query, params)

def init_db():
    """
    Initialize the database schema.
    """
    # execute_query("DROP TABLE IF EXISTS prompt_versions") # Removed for persistence
    create_prompts_table = """
    CREATE TABLE IF NOT EXISTS prompt_versions (
        id VARCHAR PRIMARY KEY, 
        name VARCHAR,
        version INTEGER,
        content TEXT,
        description TEXT,
        variables JSON, 
        tags JSON, 
        model_parameters JSON, 
        environment VARCHAR, 
        author VARCHAR,
        created_at TIMESTAMP,
        mlflow_run_id VARCHAR,
        is_active BOOLEAN DEFAULT TRUE
    );
    """
    execute_query(create_prompts_table)

# Auto-initialize on import for this demo
try:
    init_db()
except Exception as e:
    print(f"DB Init failed: {e}")

