import psycopg2
from psycopg2.extras import RealDictCursor
from app.db.config import DB_CONFIG

def get_connection():
    """
    Returns a new psycopg2 connection.
    Use context manager in services for cleanup.
    """
    return psycopg2.connect(
        cursor_factory=RealDictCursor,
        **DB_CONFIG
    )
