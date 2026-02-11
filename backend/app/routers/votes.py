from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import get_verified_user, log_action

router = APIRouter()


# ── POST /votes/{product_id} ──────────────────────────────────────────────────
# Toggle : vote si pas encore voté, retire le vote sinon

@router.post("/{product_id}")
def toggle_vote(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_verified_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable.")

    existing = db.query(models.Vote).filter(
        models.Vote.user_id    == current_user.id,
        models.Vote.product_id == product_id,
    ).first()

    if existing:
        # Retrait du vote
        db.delete(existing)
        product.likes = max(0, product.likes - 1)
        db.commit()
        return {"voted": False, "likes": product.likes}
    else:
        # Ajout du vote
        vote = models.Vote(user_id=current_user.id, product_id=product_id)
        db.add(vote)
        product.likes += 1
        db.commit()
        log_action(db, "vote", current_user.id, f"Product#{product_id}")
        return {"voted": True, "likes": product.likes}


# ── GET /votes/{product_id}/status ────────────────────────────────────────────

@router.get("/{product_id}/status")
def vote_status(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_verified_user),
):
    voted = db.query(models.Vote).filter(
        models.Vote.user_id    == current_user.id,
        models.Vote.product_id == product_id,
    ).first() is not None

    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable.")

    return {"voted": voted, "likes": product.likes}