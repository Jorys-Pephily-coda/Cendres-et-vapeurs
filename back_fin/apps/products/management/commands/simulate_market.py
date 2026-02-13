"""
Commande de simulation de marché pour la bourse des produits
Usage: python manage.py simulate_market [--interval=1] [--duration=3600] [--volatility=1.0] [--influence=1.0]
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.products.models import Product, PriceHistory
from decimal import Decimal
import random
import time
import math


class Command(BaseCommand):
    help = 'Simule les fluctuations de prix du marché'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=1,
            help='Intervalle entre chaque tick en secondes (défaut: 1)'
        )
        parser.add_argument(
            '--duration',
            type=int,
            default=0,
            help='Durée totale de la simulation en secondes (0 = infini, défaut: 0)'
        )
        parser.add_argument(
            '--volatility',
            type=float,
            default=1.0,
            help='Multiplicateur de volatilité (défaut: 1.0)'
        )
        parser.add_argument(
            '--influence',
            type=float,
            default=1.0,
            help='Multiplicateur d\'influence global (défaut: 1.0)'
        )

    def handle(self, *args, **options):
        interval = options['interval']
        duration = options['duration']
        volatility = options['volatility']
        influence = options['influence']
        
        self.stdout.write(self.style.SUCCESS(
            f'🎲 Démarrage de la simulation de marché'
        ))
        self.stdout.write(
            f'   Intervalle: {interval}s | Durée: {duration if duration else "∞"}s | Volatilité: x{volatility} | Influence: x{influence}'
        )
        
        start_time = time.time()
        tick_count = 0
        
        try:
            while True:
                tick_count += 1
                current_time = time.time() - start_time
                
                # Arrêter si la durée est atteinte
                if duration > 0 and current_time >= duration:
                    break
                
                self.stdout.write(f'\n⏱️  Tick #{tick_count} ({int(current_time)}s)')
                
                # Simuler chaque produit actif
                products = Product.objects.filter(is_active=True)
                
                for product in products:
                    old_price = product.current_price
                    new_price = self.simulate_price_change(
                        product,
                        interval_seconds=interval,
                        volatility_multiplier=volatility,
                        influence_multiplier=influence,
                    )
                    change_pct = ((new_price - old_price) / old_price * 100)
                    
                    # Mettre à jour le prix
                    product.current_price = new_price
                    product.save()
                    
                    # Enregistrer dans l'historique
                    PriceHistory.objects.create(
                        product=product,
                        price=new_price,
                        action='simulation'
                    )
                    
                    # Afficher le changement
                    emoji = '📈' if change_pct > 0 else '📉' if change_pct < 0 else '➡️'
                    self.stdout.write(
                        f'   {emoji} {product.name[:30]:30} {old_price:>8.2f}€ → {new_price:>8.2f}€ '
                        f'({change_pct:+.2f}%)'
                    )
                
                # Attendre avant le prochain tick
                time.sleep(interval)
                
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('\n⚠️  Simulation interrompue par l\'utilisateur'))
        
        self.stdout.write(self.style.SUCCESS(
            f'\n✅ Simulation terminée après {tick_count} ticks ({int(time.time() - start_time)}s)'
        ))

    def simulate_price_change(self, product, interval_seconds, volatility_multiplier=1.0, influence_multiplier=1.0):
        """
        Simule le changement de prix basé sur plusieurs facteurs.
        Objectif: un résultat plus "vivant" (plus random), mais dont l'intensité dépend
        d'une variable d'influence (volatilité par produit).
        """
        current_price = product.current_price
        base_price = product.base_price

        # Influence par produit (volatilité) + multiplicateur global
        influence = self.calculate_influence(product) * float(influence_multiplier)
        
        # 1) Pression offre/demande (plutôt stable)
        supply_demand_factor = self.calculate_supply_demand(product)

        # 2) Retour vers la moyenne (évite que ça parte trop loin)
        mean_reversion = self.calculate_mean_reversion(product)

        # 3) Momentum (tendance récente)
        momentum = self.calculate_momentum(product)

        # 4) Bruit stochastique (random principal) avec variance qui dépend de:
        # - interval_seconds (plus l'interval est long, plus ça bouge)
        # - volatility_multiplier (réglage global)
        # - influence (par produit)
        market_noise = self.calculate_market_volatility(
            interval_seconds=interval_seconds,
            volatility_multiplier=volatility_multiplier,
            influence=influence,
        )

        # 5) Événements aléatoires "jump" (rares mais impactants), dépend aussi de l'influence
        random_event = self.random_market_event(
            influence=influence,
            volatility_multiplier=volatility_multiplier,
        )

        # Combiner (les coefficients gardent une dynamique lisible)
        total_change = (
            supply_demand_factor * 0.25 +
            mean_reversion * 0.35 +
            momentum * 0.15 +
            market_noise * 1.0 +
            random_event * 1.0
        )
        
        # Appliquer le changement
        new_price = current_price * (Decimal('1') + Decimal(str(total_change)))
        
        # Contraintes de prix
        min_price = base_price * Decimal('0.3')  # Minimum 30% du prix de base
        max_price = base_price * Decimal('3.0')  # Maximum 300% du prix de base
        
        new_price = max(min_price, min(max_price, new_price))
        
        return new_price.quantize(Decimal('0.01'))

    def calculate_influence(self, product):
        """
        Calcule une influence (volatilité) par produit.

        Idée: plus un produit est "populaire" et/ou "tendu" (peu de stock, beaucoup d'achats/vues/votes),
        plus sa volatilité est forte.

        Retourne un facteur borné ~[0.6 ; 2.5].
        """
        votes = getattr(product, 'vote_count', 0) or 0
        views = getattr(product, 'view_count', 0) or 0
        purchases = getattr(product, 'purchase_count', 0) or 0
        stock = getattr(product, 'stock', 0) or 0

        # facteurs "lents" (log pour éviter l'explosion)
        vote_factor = 1.0 + 0.15 * math.log1p(float(votes))
        activity_factor = 1.0 + 0.05 * math.log1p(float(views) / 50.0) + 0.10 * math.log1p(float(purchases))

        # faible stock => volatilité un peu plus forte
        scarcity = 1.0 - (float(stock) / (float(stock) + 20.0))
        scarcity_factor = 1.0 + 0.35 * scarcity

        influence = vote_factor * activity_factor * scarcity_factor
        return max(0.6, min(2.5, influence))

    def calculate_supply_demand(self, product):
        """
        Calcule l'impact de l'offre et la demande
        Stock élevé = pression à la baisse
        Achats récents élevés = pression à la hausse
        """
        stock = max(int(product.stock or 0), 0)
        purchases = max(int(product.purchase_count or 0), 0)

        # Pas de stock => pression haussière
        if stock == 0:
            base_pressure = 0.03
        # Pas d'achat => pression baissière légère
        elif purchases == 0:
            base_pressure = -0.01
        else:
            demand_ratio = purchases / max(stock, 1)
            # Ratio > 1 => hausse, < 1 => baisse. Clamp pour rester raisonnable.
            base_pressure = max(-0.03, min(0.03, (demand_ratio - 1.0) * 0.012))

        # Mini bruit pour éviter un comportement trop "mécanique"
        return base_pressure + random.uniform(-0.002, 0.002)

    def calculate_market_volatility(self, interval_seconds, volatility_multiplier, influence):
        """
        Bruit de marché (Brownian motion) dont l'écart-type dépend du temps et de l'influence.

        - interval_seconds augmente l'amplitude ~ sqrt(dt)
        - volatility_multiplier est un réglage global
        - influence augmente/réduit la volatilité par produit
        """
        dt = max(float(interval_seconds), 1.0)
        sigma_per_second = 0.003  # ~0.3% / seconde (avant influence)
        sigma = sigma_per_second * math.sqrt(dt) * float(volatility_multiplier) * float(influence)
        return random.gauss(0, sigma)

    def calculate_mean_reversion(self, product):
        """
        Tendance à revenir vers le prix de base
        Plus le prix est éloigné, plus la force de rappel est forte
        """
        current_price = float(product.current_price)
        base_price = float(product.base_price)
        
        deviation = (current_price - base_price) / base_price
        
        # Force de rappel proportionnelle à l'écart
        reversion_strength = 0.05  # 5% de force de rappel
        return -deviation * reversion_strength

    def calculate_momentum(self, product):
        """
        Tendance basée sur l'historique récent (les 5 dernières entrées)
        """
        recent_history = PriceHistory.objects.filter(
            product=product
        ).order_by('-timestamp')[:5]
        
        if len(recent_history) < 2:
            return 0
        
        # Calculer la tendance moyenne
        prices = [float(h.price) for h in recent_history]
        trend = (prices[0] - prices[-1]) / prices[-1]
        
        # Le momentum suit la tendance avec un facteur d'inertie
        momentum_factor = 0.3  # 30% de l'inertie
        return trend * momentum_factor

    def random_market_event(self, influence, volatility_multiplier):
        """
        Événements aléatoires "jump" rares mais significatifs.
        Plus l'influence est haute, plus c'est probable et plus l'impact est grand.
        """
        # Proba de jump: ~1% de base, amplifiée par influence et volatility
        p = 0.01 * float(influence) * float(volatility_multiplier)
        p = max(0.0, min(0.05, p))

        if random.random() > p:
            return 0

        # Jump centré sur 0, borné (évite les extrêmes)
        jump_sigma = 0.04 * float(influence) * float(volatility_multiplier)
        jump = random.gauss(0, jump_sigma)
        return max(-0.25, min(0.25, jump))
