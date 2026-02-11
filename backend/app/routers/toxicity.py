from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import random

from app.database import get_db
from app import schemas

router = APIRouter()

THRESHOLD = 70.0


# ── GET /toxicity/current ─────────────────────────────────────────────────────

@router.get("/current", response_model=schemas.ToxicityOut)
def get_toxicity():
    """
    Génère un taux de soufre aléatoire simulé pour la colonie.
    Pondéré pour rester majoritairement sous le seuil,
    avec des pics occasionnels d'alerte.
    """
    # 20% de chance d'un pic critique (70-100)
    if random.random() < 0.20:
        level = round(random.uniform(70, 100), 1)
    else:
        level = round(random.uniform(5, 69), 1)

    return schemas.ToxicityOut(
        level=level,
        threshold=THRESHOLD,
        alert=level >= THRESHOLD,
    )