from django.db import models
from django.conf import settings


class ChatMessage(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_messages'
    )

    message = models.TextField(verbose_name='Message')
    is_system = models.BooleanField(default=False, verbose_name='Message système')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')

    class Meta:
        verbose_name = 'Message de chat'
        verbose_name_plural = 'Messages de chat'
        ordering = ['created_at']
    def __str__(self):
        return f"{self.user.username}: {self.message[:50]}"
    def to_dict(self):
        return {
            'id': self.id,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'role': self.user.role
            },
            'message': self.message,
            'is_system': self.is_system,
            'created_at': self.created_at.isoformat()
        }
