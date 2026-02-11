import random
import math
from sqlalchemy.orm import Session
from app import models


# ── Constantes ────────────────────────────────────────────────────────────────

BASE_VARIATION    = 0.05   # ±5% variation de base
DEMAND_WEIGHT     = 0.02   # +2% par tranche de 10 ventes récentes
VIEW_WEIGHT       = 0.001  # +0.1% par vue
MAX_VARIATION     = 0.15   # plafond à ±15%
MIN_PRICE         = 0.01


# ── Moteur de fluctuation ─────────────────────────────────────────────────────

def compute_variation(product: models.Product) -> float:
    """
    Calcule un coefficient de variation basé sur :
    - une composante aléatoire (bruit de marché)
    - la demande simulée (ventes et vues)

    Retourne un float entre -MAX_VARIATION et +MAX_VARIATION.
    """
    # Composante aléatoire — bruit gaussien centré
    noise = random.gauss(0, BASE_VARIATION / 2)

    # Pression de la demande : plus de vues/ventes → tendance à la hausse
    demand_score = (product.sales * DEMAND_WEIGHT) + (product.views * VIEW_WEIGHT)
    # Plafonner la pression de demande à +5%
    demand_pressure = min(demand_score, 0.05)

    # Variation finale bornée
    raw = noise + demand_pressure
    return max(-MAX_VARIATION, min(MAX_VARIATION, raw))


def apply_fluctuation(product: models.Product, db: Session) -> float:
    """
    Applique la variation calculée au prix du produit.
    Persiste en base et retourne le nouveau prix.
    """
    variation = compute_variation(product)
    new_price  = round(max(MIN_PRICE, product.price * (1 + variation)), 2)

    product.price_modifier = round(variation * 100, 2)
    product.price          = new_price

    db.commit()
    return new_price


def apply_fluctuation_bulk(products: list[models.Product], db: Session) -> None:
    """
    Applique la fluctuation à une liste de produits en un seul commit.
    Utilisé par le router /market.
    """
    for product in products:
        variation             = compute_variation(product)
        product.price_modifier = round(variation * 100, 2)
        product.price         = round(max(MIN_PRICE, product.price * (1 + variation)), 2)
    db.commit()


def get_trend(modifier: float) -> str:
    """
    Retourne la tendance lisible depuis le price_modifier stocké.
    Utilisable côté frontend pour enrichir les réponses.
    """
    if modifier > 0.5:
        return "up"
    if modifier < -0.5:
        return "down"
    return "stable"