from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from dotenv import load_dotenv
import os

from app.database import get_db
from app import models

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "changeme_super_secret")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        raw_id  = payload.get("sub")
        if raw_id is None:
            raise credentials_exception
        user_id = int(raw_id)  # sub encodé comme str, on cast en int
    except (JWTError, ValueError, TypeError):
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


def get_verified_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte non vérifié. Validez votre code OTP.",
        )
    return current_user


def require_role(*roles: str):
    def _check(current_user: models.User = Depends(get_verified_user)) -> models.User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accès réservé aux rôles : {', '.join(roles)}.",
            )
        return current_user
    return _check


require_user   = Depends(get_verified_user)
require_editor = Depends(require_role("editor", "admin"))
require_admin  = Depends(require_role("admin"))


def log_action(
    db: Session,
    action: str,
    user_id: int | None = None,
    entity: str | None = None,
) -> None:
    entry = models.ActionLog(user_id=user_id, action=action, entity=entity)
    db.add(entry)
    db.commit()