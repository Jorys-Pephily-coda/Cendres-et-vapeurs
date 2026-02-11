from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
import hashlib

from app.database import get_db
from app import models, schemas
from app.dependencies import log_action, get_verified_user

router = APIRouter()
logger = logging.getLogger(__name__)


def generate_thread_id(email: str) -> str:
    """Génère un identifiant de conversation basé sur l'email."""
    return hashlib.sha256(email.encode()).hexdigest()[:16]


@router.post("/", status_code=status.HTTP_200_OK)
async def send_contact(
    payload: schemas.ContactRequest,
    db: Session = Depends(get_db),
):
    thread_id = generate_thread_id(payload.email)
    
    # Persister le message dans conversation_messages
    message = models.ConversationMessage(
        thread_id=thread_id,
        sender_type="user",
        sender_email=payload.email,
        subject=payload.subject,
        content=payload.message,
    )
    db.add(message)
    db.commit()

    log_action(db, "contact_sent", None, payload.email)
    logger.info(f"Message de contact reçu de {payload.email}")

    return {"message": "Message transmis avec succès."}


@router.get("/my-messages")
def get_my_messages(
    current_user: models.User = Depends(get_verified_user),
    db: Session = Depends(get_db),
):
    """Retourne tous les messages d'une conversation pour l'utilisateur connecté."""
    thread_id = generate_thread_id(current_user.email)
    
    messages = (
        db.query(models.ConversationMessage)
        .filter(models.ConversationMessage.thread_id == thread_id)
        .order_by(models.ConversationMessage.id.asc())
        .all()
    )
    
    return [
        {
            "id":           m.id,
            "sender_type":  m.sender_type,
            "sender_email": m.sender_email,
            "subject":      m.subject,
            "content":      m.content,
            "created_at":   m.created_at,
        }
        for m in messages
    ]