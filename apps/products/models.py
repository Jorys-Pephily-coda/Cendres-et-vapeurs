from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
import random


class Product(models.Model):
    name = models.CharField(max_length=200, verbose_name='Nom')
    description = models.TextField(verbose_name='Description')
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Prix de base'
    )

    current_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Prix actuel'
    )

    stock = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name='Stock'
    )
    image = models.ImageField(
        upload_to='products/',
        null=True,
        blank=True,
        verbose_name='Image'
    )

    category = models.CharField(max_length=100, blank=True, verbose_name='Catégorie')
    is_active = models.BooleanField(default=True, verbose_name='Actif')
    view_count = models.IntegerField(default=0, verbose_name='Nombre de vues')
    purchase_count = models.IntegerField(default=0, verbose_name='Nombre d\'achats')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Date de modification')

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products_created'
    )

    class Meta:
        verbose_name = 'Produit'
        verbose_name_plural = 'Produits'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.current_price:
            self.current_price = self.base_price

        super().save(*args, **kwargs)

    @property
    def vote_count(self):
        return self.votes.count()

    @property
    def price_trend(self):
        if self.current_price > self.base_price * Decimal('1.05'):
            return 'up'
        elif self.current_price < self.base_price * Decimal('0.95'):
            return 'down'

        return 'stable'

    def fluctuate_price(self, action='view'):
        if action == 'view':
            self.view_count += 1
            fluctuation = random.uniform(0, 0.02)
        elif action == 'purchase':
            self.purchase_count += 1
            fluctuation = random.uniform(0.02, 0.05)
        else:
            fluctuation = 0

        if fluctuation > 0:
            self.current_price = self.current_price * (Decimal('1') + Decimal(str(fluctuation)))
            max_price = self.base_price * Decimal('2')

            if self.current_price > max_price:
                self.current_price = max_price

        PriceHistory.objects.create(
            product=self,
            price=self.current_price,
            action=action
        )

        self.save()


class ProductVote(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='votes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='product_votes'
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de vote')

    class Meta:
        verbose_name = 'Vote produit'
        verbose_name_plural = 'Votes produits'
        unique_together = ['product', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} → {self.product.name}"


class PriceHistory(models.Model):
    ACTION_CHOICES = [
        ('view', 'Consultation'),
        ('purchase', 'Achat'),
        ('manual', 'Ajustement manuel'),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='price_history'
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Prix'
    )

    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        default='view',
        verbose_name='Action'
    )

    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Date')

    class Meta:
        verbose_name = 'Historique de prix'
        verbose_name_plural = 'Historique des prix'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.product.name} - {self.price}€ ({self.get_action_display()})"
