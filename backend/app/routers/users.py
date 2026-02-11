from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_verified_user, require_role

router = APIRouter()


# ── GET /users ────────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=list[schemas.UserPublic],
    dependencies=[Depends(require_role("admin"))],
)
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).order_by(models.User.id).all()


# ── GET /users/me ─────────────────────────────────────────────────────────────

@router.get("/me", response_model=schemas.UserPublic)
def get_me(current_user: models.User = Depends(get_verified_user)):
    return current_user


# ── GET /users/{user_id} ──────────────────────────────────────────────────────

@router.get(
    "/{user_id}",
    response_model=schemas.UserPublic,
    dependencies=[Depends(require_role("admin"))],
)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    return user


# ── PATCH /users/{user_id} ────────────────────────────────────────────────────

@router.patch(
    "/{user_id}",
    response_model=schemas.UserPublic,
    dependencies=[Depends(require_role("admin"))],
)
def update_user(
    user_id: int,
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    if payload.role is not None:
        user.role = payload.role

    db.commit()
    db.refresh(user)
    return user


# ── DELETE /users/{user_id} ───────────────────────────────────────────────────

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("admin"))],
)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    db.delete(user)
    db.commit()