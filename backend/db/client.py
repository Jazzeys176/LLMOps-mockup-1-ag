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
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        result = []
        for row in rows:
            result.append(dict(zip(columns, row)))
        return result
