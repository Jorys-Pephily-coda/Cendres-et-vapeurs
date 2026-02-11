Django management command to seed the database with sample data
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.products.models import Product, ProductVote
from apps.ecommerce.models import DiscountCode
from apps.calendar_app.models import CalendarEvent, ShiftNote
from apps.monitoring.models import ToxicityData
from apps.logs.models import ActivityLog
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
User = get_user_model()
class Command(BaseCommand):
    help = 'Seed database with sample data'
    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        self.stdout.write('Creating users...')
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@cendresetvapeur.zone',
            password='admin123',
            role=User.Role.ADMIN
        )
        editor = User.objects.create_user(
            username='editeur',
            email='editeur@cendresetvapeur.zone',
            password='editeur123',
            role=User.Role.EDITOR,
            first_name='Jean',
            last_name='Éditeur'
        )
        user = User.objects.create_user(
            username='utilisateur',
            email='user@cendresetvapeur.zone',
            password='user123',
            role=User.Role.USER,
            first_name='Marie',
            last_name='Utilisateur'
        )
        guest = User.objects.create_user(
            username='invite',
            email='invite@cendresetvapeur.zone',
            password='invite123',
            role=User.Role.GUEST
        )
        self.stdout.write(self.style.SUCCESS(' Users created'))
        self.stdout.write('Creating products...')
        products_data = [
            {
                'name': 'Masque à gaz artisanal',
                'description': 'Masque filtrant l\'air toxique de la zone. Fabrication locale avec filtres recyclés.',
                'base_price': Decimal('45.00'),
                'stock': 15,
                'category': 'Survie'
            },
            {
                'name': 'Ration de survie (7 jours)',
                'description': 'Nourriture lyophilisée garantie sans contamination. Saveur… discutable.',
                'base_price': Decimal('25.00'),
                'stock': 30,
                'category': 'Alimentation'
            },
            {
                'name': 'Générateur à vapeur portable',
                'description': 'Produit de l\'électricité à partir de vapeur. Compact et fiable.',
                'base_price': Decimal('150.00'),
                'stock': 5,
                'category': 'Énergie'
            },
            {
                'name': 'Lampe à huile renforcée',
                'description': 'Éclairage durable pour les tunnels sombres. Résiste aux chocs.',
                'base_price': Decimal('12.00'),
                'stock': 50,
                'category': 'Éclairage'
            },
            {
                'name': 'Kit de purification d\'eau',
                'description': 'Filtre les impuretés et neutralise les toxines. Essentiel pour la survie.',
                'base_price': Decimal('35.00'),
                'stock': 20,
                'category': 'Survie'
            },
            {
                'name': 'Couverture thermique',
                'description': 'Garde la chaleur durant les nuits glaciales de la zone franche.',
                'base_price': Decimal('18.00'),
                'stock': 40,
                'category': 'Confort'
            },
        ]
        products = []
        for data in products_data:
            product = Product.objects.create(
                created_by=editor,
                **data
            )
            products.append(product)
        self.stdout.write(self.style.SUCCESS(f' {len(products)} products created'))
        self.stdout.write('Adding product votes...')
        for product in products[:3]:
            ProductVote.objects.create(product=product, user=user)
            ProductVote.objects.create(product=product, user=editor)
        self.stdout.write(self.style.SUCCESS(' Votes added'))
        self.stdout.write('Creating discount codes...')
        DiscountCode.objects.create(
            code='BIENVENUE',
            description='Code de bienvenue pour nouveaux survivants',
            discount_type='percentage',
            discount_value=Decimal('10.00'),
            min_purchase=Decimal('20.00'),
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=30)
        )
        DiscountCode.objects.create(
            code='ZONE50',
            description='50% de réduction pour les anciens de la zone',
            discount_type='percentage',
            discount_value=Decimal('50.00'),
            min_purchase=Decimal('100.00'),
            max_uses=10,
            valid_from=timezone.now(),
            valid_until=timezone.now() + timedelta(days=7)
        )
        self.stdout.write(self.style.SUCCESS(' Discount codes created'))
        self.stdout.write('Creating calendar events...')
        CalendarEvent.objects.create(
            title='Ravitaillement mensuel',
            description='Arrivée du convoi de ravitaillement depuis la surface',
            start_date=timezone.now() + timedelta(days=5),
            end_date=timezone.now() + timedelta(days=5, hours=4),
            priority='high',
            location='Quai principal',
            created_by=admin
        )
        CalendarEvent.objects.create(
            title='Maintenance chaudière',
            description='Arrêt programmé pour entretien du système de vapeur',
            start_date=timezone.now() + timedelta(days=10),
            end_date=timezone.now() + timedelta(days=10, hours=6),
            priority='critical',
            location='Salle des machines',
            created_by=editor
        )
        CalendarEvent.objects.create(
            title='Couvre-feu',
            description='Couvre-feu obligatoire - Alerte toxicité',
            start_date=timezone.now() + timedelta(days=2, hours=20),
            end_date=timezone.now() + timedelta(days=3, hours=6),
            priority='high',
            is_all_day=False,
            location='Toute la zone',
            created_by=admin
        )
        self.stdout.write(self.style.SUCCESS(' Calendar events created'))
        self.stdout.write('Creating shift notes...')
        ShiftNote.objects.create(
            user=user,
            date=timezone.now().date(),
            shift='morning',
            content='Niveau de toxicité stable. Aucun incident à signaler.',
            is_important=False
        )
        ShiftNote.objects.create(
            user=editor,
            date=timezone.now().date(),
            shift='evening',
            content='Pic de soufre détecté à 18h. Ventilation renforcée activée.',
            is_important=True
        )
        self.stdout.write(self.style.SUCCESS(' Shift notes created'))
        self.stdout.write('Generating toxicity data...')
        for i in range(10):
            ToxicityData.generate_random_data()
        self.stdout.write(self.style.SUCCESS(' Toxicity data generated'))
        self.stdout.write('Creating activity logs...')
        ActivityLog.objects.create(
            user=admin,
            action_type='user_registered',
            description='Système initialisé - Premier administrateur créé'
        )
        ActivityLog.objects.create(
            user=editor,
            action_type='product_created',
            description='Nouveau catalogue de survie ajouté'
        )
        ActivityLog.objects.create(
            user=user,
            action_type='product_voted',
            description='Vote pour les masques à gaz'
        )
        self.stdout.write(self.style.SUCCESS(' Activity logs created'))
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS(' Database seeded successfully!'))
        self.stdout.write('='*50 + '\n')
        self.stdout.write('Comptes créés:')
        self.stdout.write(f'  • Admin: admin / admin123 (ADMIN)')
        self.stdout.write(f'  • Éditeur: editeur / editeur123 (EDITOR)')
        self.stdout.write(f'  • Utilisateur: utilisateur / user123 (USER)')
        self.stdout.write(f'  • Invité: invite / invite123 (GUEST)')
        self.stdout.write('\nCodes promo:')
        self.stdout.write(f'  • BIENVENUE (-10%)')
        self.stdout.write(f'  • ZONE50 (-50%)')
        self.stdout.write('\n Prêt pour le test!')
