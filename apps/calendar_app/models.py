
from django.db import models
from django.conf import settings
class CalendarEvent(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Basse'),
        ('medium', 'Moyenne'),
        ('high', 'Haute'),
        ('critical', 'Critique'),
    ]
    title = models.CharField(max_length=200, verbose_name='Titre')
    description = models.TextField(blank=True, verbose_name='Description')
    start_date = models.DateTimeField(verbose_name='Date de début')
    end_date = models.DateTimeField(verbose_name='Date de fin')
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium',
        verbose_name='Priorité'
    )
    is_all_day = models.BooleanField(default=False, verbose_name='Toute la journée')
    location = models.CharField(max_length=200, blank=True, verbose_name='Lieu')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='events_created'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Date de modification')
    class Meta:
        verbose_name = 'Événement'
        verbose_name_plural = 'Événements'
        ordering = ['start_date']
    def __str__(self):
        return f"{self.title} - {self.start_date.strftime('%d/%m/%Y')}"
class ShiftNote(models.Model):
    SHIFT_CHOICES = [
        ('morning', 'Quart du matin'),
        ('evening', 'Quart du soir'),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shift_notes'
    )
    date = models.DateField(verbose_name='Date')
    shift = models.CharField(
        max_length=20,
        choices=SHIFT_CHOICES,
        verbose_name='Quart'
    )
    content = models.TextField(verbose_name='Contenu')
    is_important = models.BooleanField(default=False, verbose_name='Important')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Date de création')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Date de modification')
    class Meta:
        verbose_name = 'Note de quart'
        verbose_name_plural = 'Notes de quart'
        unique_together = ['user', 'date', 'shift']
        ordering = ['-date', '-shift']
    def __str__(self):
        return f"{self.user.username} - {self.date} ({self.get_shift_display()})"
