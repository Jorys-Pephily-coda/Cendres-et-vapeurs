from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime
from dotenv import load_dotenv
import os, json, logging

from app.database import SessionLocal
from app import models

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

logger = logging.getLogger(__name__)
router = APIRouter()

active_connections: dict[int, WebSocket] = {}


def get_user_from_token(token: str, db: Session) -> models.User | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        raw_id  = payload.get("sub")
        if raw_id is None:
            logger.warning("[WS] sub absent du token")
            return None
        user_id = int(raw_id)
    except (JWTError, ValueError, TypeError) as e:
        logger.warning(f"[WS] Token invalide: {e}")
        return None

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        logger.info(f"[WS] Utilisateur trouvé: {user.email} role={user.role}")
    else:
        logger.warning(f"[WS] Aucun user pour id={user_id}")
    return user


async def broadcast(message: dict) -> None:
    disconnected = []
    for uid, ws in active_connections.items():
        try:
            await ws.send_text(json.dumps(message))
        except Exception:
            disconnected.append(uid)
    for uid in disconnected:
        active_connections.pop(uid, None)


@router.websocket("/ws/chat")
async def chat_endpoint(websocket: WebSocket, token: str = Query(...)):
    db   = SessionLocal()
    user = get_user_from_token(token, db)

    if not user:
        logger.warning("[WS] Connexion refusée — token invalide")
        await websocket.close(code=1008)
        db.close()
        return

    if user.role not in ("editor", "admin"):
        logger.warning(f"[WS] Connexion refusée — rôle insuffisant: {user.role}")
        await websocket.close(code=1008)
        db.close()
        return

    await websocket.accept()
    active_connections[user.id] = websocket
    logger.info(f"[WS] {user.email} connecté")

    # Historique
    history = (
        db.query(models.ChatMessage)
        .order_by(models.ChatMessage.id.desc())
        .limit(50)
        .all()
    )
    for msg in reversed(history):
        sender_email = msg.sender.email if msg.sender else "inconnu"
        await websocket.send_text(json.dumps({
            "id":           msg.id,
            "sender_id":    msg.sender_id,
            "sender_email": sender_email,
            "content":      msg.content,
            "created_at":   msg.created_at,
        }))

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data    = json.loads(raw)
                content = str(data.get("content", "")).strip()
            except (json.JSONDecodeError, AttributeError):
                content = raw.strip()

            if not content:
                continue

            now      = datetime.utcnow().isoformat()
            chat_msg = models.ChatMessage(
                sender_id=user.id,
                content=content,
                created_at=now,
            )
            db.add(chat_msg)
            db.commit()
            db.refresh(chat_msg)

            await broadcast({
                "id":           chat_msg.id,
                "sender_id":    user.id,
                "sender_email": user.email,
                "content":      content,
                "created_at":   now,
            })

    except WebSocketDisconnect:
        active_connections.pop(user.id, None)
        logger.info(f"[WS] {user.email} déconnecté")
    finally:
        db.close()