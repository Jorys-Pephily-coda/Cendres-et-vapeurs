from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from apps.products.models import Product


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart'
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Date de modification')

    class Meta:
        verbose_name = 'Panier'
        verbose_name_plural = 'Paniers'

    def __str__(self):
        return f"Panier de {self.user.username}"

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def items_count(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name='Quantité'
    )

    added_at = models.DateTimeField(auto_now_add=True, verbose_name='Ajouté le')

    class Meta:
        verbose_name = 'Article du panier'
        verbose_name_plural = 'Articles du panier'
        unique_together = ['cart', 'product']

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    @property
    def subtotal(self):
        return self.product.current_price * self.quantity


class DiscountCode(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Pourcentage'),
        ('fixed', 'Montant fixe'),
    ]

    code = models.CharField(max_length=50, unique=True, verbose_name='Code')
    description = models.TextField(blank=True, verbose_name='Description')

    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES,
        default='percentage',
        verbose_name='Type de réduction'
    )

    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Valeur de réduction'
    )

    min_purchase = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0'),
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name='Achat minimum'
    )

    max_uses = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name='Utilisations max'
    )

    uses_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Nombre d\'utilisations'
    )

    is_active = models.BooleanField(default=True, verbose_name='Actif')
    valid_from = models.DateTimeField(verbose_name='Valide du')
    valid_until = models.DateTimeField(verbose_name='Valide jusqu\'au')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')

    class Meta:
        verbose_name = 'Code promo'
        verbose_name_plural = 'Codes promo'
        ordering = ['-created_at']

    def __str__(self):
        return self.code

    def calculate_discount(self, total):
        if self.discount_type == 'percentage':
            return total * (self.discount_value / Decimal('100'))
        else:
            return min(self.discount_value, total)

    def is_valid(self, total):
        from django.utils import timezone
        now = timezone.now()

        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            (self.max_uses is None or self.uses_count < self.max_uses) and
            total >= self.min_purchase
        )


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('processing', 'En traitement'),
        ('shipped', 'Expédiée'),
        ('delivered', 'Livrée'),
        ('cancelled', 'Annulée'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )

    order_number = models.CharField(max_length=50, unique=True, verbose_name='Numéro de commande')

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Statut'
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Sous-total'
    )

    discount_code = models.ForeignKey(
        DiscountCode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )

    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0'),
        verbose_name='Montant de réduction'
    )

    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Total'
    )

    notes = models.TextField(blank=True, verbose_name='Notes')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Date de modification')

    class Meta:
        verbose_name = 'Commande'
        verbose_name_plural = 'Commandes'
        ordering = ['-created_at']

    def __str__(self):
        return f"Commande {self.order_number} - {self.user.username}"

    @staticmethod
    def generate_order_number():
        import uuid
        from django.utils import timezone

        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        random_part = str(uuid.uuid4())[:8].upper()

        return f"ORD-{timestamp}-{random_part}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT
    )

    product_name = models.CharField(max_length=200, verbose_name='Nom du produit')

    product_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Prix unitaire'
    )

    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Quantité'
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Sous-total'
    )

    class Meta:
        verbose_name = 'Article de commande'
        verbose_name_plural = 'Articles de commande'

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"

    def save(self, *args, **kwargs):
        if not self.product_name:
            self.product_name = self.product.name

        if not self.product_price:
            self.product_price = self.product.current_price

        if not self.subtotal:
            self.subtotal = self.product_price * self.quantity

        super().save(*args, **kwargs)
