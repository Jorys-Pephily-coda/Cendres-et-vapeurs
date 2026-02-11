from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app import models
from app.dependencies import require_role

router = APIRouter()


@router.get("/conversations", dependencies=[Depends(require_role("editor"))])
def get_all_conversations(db: Session = Depends(get_db)):
    """Retourne toutes les conversations groupées par thread_id. UNIQUEMENT pour editor."""
    messages = (
        db.query(models.ConversationMessage)
        .order_by(models.ConversationMessage.created_at.desc())
        .all()
    )
    
    # Grouper par thread_id
    threads = {}
    for msg in messages:
        if msg.thread_id not in threads:
            threads[msg.thread_id] = {
                "thread_id":    msg.thread_id,
                "user_email":   msg.sender_email if msg.sender_type == "user" else None,
                "last_subject": msg.subject,
                "last_message": msg.content[:100],
                "last_updated": msg.created_at,
                "messages":     [],
            }
        threads[msg.thread_id]["messages"].append({
            "id":           msg.id,
            "sender_type":  msg.sender_type,
            "sender_email": msg.sender_email,
            "subject":      msg.subject,
            "content":      msg.content,
            "created_at":   msg.created_at,
        })
    
    # Extraire user_email depuis le premier message user
    for thread in threads.values():
        for msg in thread["messages"]:
            if msg["sender_type"] == "user":
                thread["user_email"] = msg["sender_email"]
                break
    
    return list(threads.values())


class ReplyRequest(BaseModel):
    thread_id: str
    content:   str


@router.post("/reply", dependencies=[Depends(require_role("editor"))])
def reply_to_conversation(
    payload: ReplyRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("editor")),
):
    """L'editor répond à une conversation. UNIQUEMENT pour editor."""
    # Récupérer le sujet de la conversation
    first_msg = (
        db.query(models.ConversationMessage)
        .filter(models.ConversationMessage.thread_id == payload.thread_id)
        .order_by(models.ConversationMessage.id.asc())
        .first()
    )
    
    subject = f"Re: {first_msg.subject}" if first_msg and first_msg.subject else "Réponse"
    
    reply = models.ConversationMessage(
        thread_id=payload.thread_id,
        sender_type="editor",
        sender_email=current_user.email,
        subject=subject,
        content=payload.content,
    )
    db.add(reply)
    db.commit()
    
    return {"message": "Réponse envoyée."}


@router.get("/discount-codes", dependencies=[Depends(require_role("editor", "admin"))])
def get_discount_codes(db: Session = Depends(get_db)):
    """Retourne tous les codes de réduction. Pour editor ET admin."""
    codes = db.query(models.DiscountCode).all()
    return [
        {
            "id":       c.id,
            "code":     c.code,
            "percent":  c.percent,
            "max_uses": c.max_uses,
            "uses":     c.uses,
        }
        for c in codes
    ]