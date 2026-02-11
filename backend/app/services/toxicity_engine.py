import random
import math
from datetime import datetime
from collections import deque


# ── Constantes ────────────────────────────────────────────────────────────────

THRESHOLD        = 70.0   # Seuil d'alerte rouge
HISTORY_SIZE     = 100    # Nombre de mesures conservées en mémoire
BASE_LEVEL       = 35.0   # Niveau moyen de fond
VOLATILITY       = 12.0   # Écart-type de la variation gaussienne
SPIKE_CHANCE     = 0.15   # 15% de chance d'un pic critique à chaque mesure
SPIKE_MIN        = 72.0
SPIKE_MAX        = 98.0
RECOVERY_RATE    = 0.85   # Le niveau revient progressivement vers la base


# ── État interne (singleton en mémoire) ──────────────────────────────────────

class ToxicityEngine:
    def __init__(self):
        self._current: float = BASE_LEVEL
        self._history: deque = deque(maxlen=HISTORY_SIZE)
        self._in_spike: bool = False

    def next(self) -> dict:
        """
        Calcule la prochaine mesure de toxicité.
        Simule des pics réalistes et une récupération progressive.
        """
        now = datetime.utcnow().isoformat()

        if self._in_spike:
            # Récupération progressive depuis un pic
            self._current = self._current * RECOVERY_RATE + BASE_LEVEL * (1 - RECOVERY_RATE)
            self._in_spike = self._current >= THRESHOLD
        elif random.random() < SPIKE_CHANCE:
            # Déclenchement d'un pic
            self._current  = round(random.uniform(SPIKE_MIN, SPIKE_MAX), 1)
            self._in_spike = True
        else:
            # Variation gaussienne autour du niveau de base
            noise          = random.gauss(0, VOLATILITY)
            self._current  = round(
                max(0.0, min(100.0, BASE_LEVEL + noise)),
                1
            )

        level = round(self._current, 1)
        alert = level >= THRESHOLD

        measurement = {
            "level":     level,
            "threshold": THRESHOLD,
            "alert":     alert,
            "timestamp": now,
        }
        self._history.append(measurement)
        return measurement

    def current(self) -> dict:
        """Retourne la dernière mesure sans en générer une nouvelle."""
        if not self._history:
            return self.next()
        return self._history[-1]

    def history(self, n: int = 20) -> list[dict]:
        """Retourne les n dernières mesures."""
        entries = list(self._history)
        return entries[-n:]

    def stats(self) -> dict:
        """Retourne des statistiques sur l'historique courant."""
        if not self._history:
            return {"mean": 0, "max": 0, "min": 0, "alert_count": 0}
        levels = [m["level"] for m in self._history]
        return {
            "mean":        round(sum(levels) / len(levels), 1),
            "max":         max(levels),
            "min":         min(levels),
            "alert_count": sum(1 for m in self._history if m["alert"]),
        }


# Instance singleton partagée entre les requêtes FastAPI
toxicity_engine = ToxicityEngine()