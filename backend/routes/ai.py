"""
AI chat API.

POST /api/ai/chat
Body: { "message": "kitne projects hain?" }
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ai.agent import run_assistant
from database import get_db
from deps.deps import get_current_user
from models import User
from schemas.ai import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        reply = run_assistant(body.message.strip(), db, current_user)
        return ChatResponse(reply=reply)
    except Exception as exc:
        # Common beginner issue: Ollama not running / wrong model name
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI is unavailable. Is Ollama running? ({exc})",
        ) from exc
