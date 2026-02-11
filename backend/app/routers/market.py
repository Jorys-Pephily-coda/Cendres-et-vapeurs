from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import random

from app.database import get_db
from app import models, schemas

router = APIRouter()

PRICE_VARIATION = 0.05  # ±5%


# ── GET /market/prices ────────────────────────────────────────────────────────

@router.get("/prices", response_model=list[schemas.MarketProductOut])
def get_market_prices(db: Session = Depends(get_db)):
    """
    Retourne tous les produits avec fluctuation de prix simulée.
    Chaque appel applique une variation aléatoire de ±5%.
    """
    products = db.query(models.Product).order_by(models.Product.id).all()

    for product in products:
        variation = random.uniform(-PRICE_VARIATION, PRICE_VARIATION)
        product.price_modifier = round(variation * 100, 2)
        product.price = round(max(0.01, product.price * (1 + variation)), 2)

    db.commit()

    return [
        schemas.MarketProductOut(
            id=p.id,
            name=p.name,
            price=p.price,
            price_modifier=p.price_modifier,
            views=p.views,
            sales=p.sales,
        )
        for p in products
    ]