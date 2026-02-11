from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import secrets


class User(AbstractUser):
    class Role(models.TextChoices):
        GUEST = 'GUEST', 'Invité'
        USER = 'USER', 'Utilisateur'
        EDITOR = 'EDITOR', 'Éditeur'
        ADMIN = 'ADMIN', 'Administrateur'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.GUEST,
        verbose_name='Rôle'
    )

    email = models.EmailField(unique=True, verbose_name='Email')
    is_2fa_enabled = models.BooleanField(default=True, verbose_name='2FA activé')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Date de modification')

    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_guest(self):
        return self.role == self.Role.GUEST

    @property
    def is_user(self):
        return self.role in [self.Role.USER, self.Role.EDITOR, self.Role.ADMIN]

    @property
    def is_editor(self):
        return self.role in [self.Role.EDITOR, self.Role.ADMIN]

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN


class TwoFactorToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tokens_2fa')
    code = models.CharField(max_length=6, verbose_name='Code 2FA')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')
    expires_at = models.DateTimeField(verbose_name='Date d\'expiration')
    is_used = models.BooleanField(default=False, verbose_name='Utilisé')

    class Meta:
        verbose_name = 'Token 2FA'
        verbose_name_plural = 'Tokens 2FA'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.code}"

    @staticmethod
    def generate_code():
        return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_code()
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)
