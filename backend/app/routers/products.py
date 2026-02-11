from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import random

from app.database import get_db
from app import models, schemas
from app.dependencies import get_verified_user, require_role, log_action

router = APIRouter()

PRICE_VARIATION = 0.05  # ±5% par consultation / achat


def fluctuate_price(product: models.Product, db: Session) -> None:
    """Applique une variation aléatoire de ±5% au prix du produit."""
    variation = random.uniform(-PRICE_VARIATION, PRICE_VARIATION)
    product.price_modifier = round(variation * 100, 2)
    product.price = round(max(0.01, product.price * (1 + variation)), 2)
    db.commit()


# ── GET /products ─────────────────────────────────────────────────────────────

@router.get("/", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).order_by(models.Product.likes.desc()).all()


# ── GET /products/{product_id} ────────────────────────────────────────────────

@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable.")

    # Incrémenter les vues et fluctuer le prix
    product.views += 1
    fluctuate_price(product, db)
    db.refresh(product)

    return product


# ── POST /products ────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=schemas.ProductOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("editor", "admin"))],
)
def create_product(
    payload: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("editor", "admin")),
):
    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    log_action(db, "product_created", current_user.id, product.name)
    return product


# ── PATCH /products/{product_id} ──────────────────────────────────────────────

@router.patch(
    "/{product_id}",
    response_model=schemas.ProductOut,
    dependencies=[Depends(require_role("editor", "admin"))],
)
def update_product(
    product_id: int,
    payload: schemas.ProductUpdate,
    db: Session = Depends(get_db),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


# ── DELETE /products/{product_id} ─────────────────────────────────────────────

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("editor", "admin"))],
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable.")
    db.delete(product)
    db.commit()