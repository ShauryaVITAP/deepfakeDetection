import os
import sqlite3
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

if os.environ.get("VERCEL"):
    DB_DIR = "/tmp"
    DB_PATH = "/tmp/aegis_chat.db"
else:
    DB_DIR = os.path.dirname(os.path.abspath(__file__))
    DB_PATH = os.path.join(DB_DIR, "aegis_chat.db")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize SQLite tables for conversations and messages."""
    os.makedirs(DB_DIR, exist_ok=True)
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                provider TEXT,
                model TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            )
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_messages_conv_id ON messages(conversation_id)
        """)
        conn.commit()

def create_conversation(title: str = "New Conversation", conv_id: Optional[str] = None) -> str:
    cid = conv_id or str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR IGNORE INTO conversations (id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        """, (cid, title, now, now))
        conn.commit()
    return cid

def get_or_create_conversation(conv_id: Optional[str], initial_title: Optional[str] = None) -> str:
    if not conv_id:
        return create_conversation(initial_title or "New Conversation")
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM conversations WHERE id = ?", (conv_id,))
        row = cursor.fetchone()
        if not row:
            return create_conversation(initial_title or "New Conversation", conv_id)
    return conv_id

def update_conversation_title(conv_id: str, title: str):
    now = datetime.utcnow().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?
        """, (title[:80], now, conv_id))
        conn.commit()

def save_message(
    conv_id: str, 
    role: str, 
    content: str, 
    provider: Optional[str] = None, 
    model: Optional[str] = None
) -> str:
    msg_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO messages (id, conversation_id, role, content, provider, model, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (msg_id, conv_id, role, content, provider, model, now))
        cursor.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conv_id))
        conn.commit()
    return msg_id

def get_conversation_history(conv_id: str, limit: int = 16) -> List[Dict[str, str]]:
    """Retrieve message history formatted for LLM context window."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT role, content FROM messages 
            WHERE conversation_id = ?
            ORDER BY created_at ASC
        """, (conv_id,))
        rows = cursor.fetchall()
        
        all_msgs = [{"role": row["role"], "content": row["content"]} for row in rows]
        # Return recent sliding window up to limit
        if len(all_msgs) > limit:
            return all_msgs[-limit:]
        return all_msgs

def get_full_conversation_messages(conv_id: str) -> List[Dict[str, Any]]:
    """Retrieve full messages with metadata for frontend display."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, role, content, provider, model, created_at 
            FROM messages 
            WHERE conversation_id = ?
            ORDER BY created_at ASC
        """, (conv_id,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def list_conversations(limit: int = 30) -> List[Dict[str, Any]]:
    """List recent conversation threads."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.id, c.title, c.created_at, c.updated_at,
                   COUNT(m.id) as message_count
            FROM conversations c
            LEFT JOIN messages m ON c.id = m.conversation_id
            GROUP BY c.id
            ORDER BY c.updated_at DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def delete_conversation(conv_id: str) -> bool:
    """Delete a conversation and all its messages."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM messages WHERE conversation_id = ?", (conv_id,))
        cursor.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
        conn.commit()
        return cursor.rowcount > 0

# Auto-initialize database on import
init_db()
