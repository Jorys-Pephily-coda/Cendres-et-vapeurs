
from django.db import models
from django.conf import settings
class ActivityLog(models.Model):

    ACTION_TYPES = [
        ('user_registered', 'Nouvel utilisateur enregistré'),
        ('user_login', 'Connexion utilisateur'),
        ('product_created', 'Produit créé'),
        ('product_updated', 'Produit modifié'),
        ('product_voted', 'Vote produit'),
        ('order_created', 'Commande créée'),
        ('event_created', 'Événement créé'),
        ('chat_message', 'Message chat'),
        ('other', 'Autre'),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs'
    )
    action_type = models.CharField(
        max_length=50,
        choices=ACTION_TYPES,
        verbose_name='Type d\'action'
    )
    description = models.TextField(verbose_name='Description')
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name='Adresse IP')
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Date')
    class Meta:
        verbose_name = 'Log d\'activité'
        verbose_name_plural = 'Logs d\'activité'
        ordering = ['-timestamp']
    def __str__(self):
        user_str = self.user.username if self.user else 'Système'
        return f"{user_str} - {self.get_action_type_display()} - {self.timestamp.strftime('%d/%m/%Y %H:%M')}"
    @staticmethod
    def log_action(user, action_type, description, ip_address=None):
        return ActivityLog.objects.create(
            user=user,
            action_type=action_type,
            description=description,
            ip_address=ip_address
        )
