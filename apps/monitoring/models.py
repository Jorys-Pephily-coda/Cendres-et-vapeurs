from django.db import models
import random
class ToxicityData(models.Model):   
    sulfur_level = models.FloatField(verbose_name='Taux de soufre (%)')
    carbon_level = models.FloatField(verbose_name='Taux de carbone (%)')
    oxygen_level = models.FloatField(verbose_name='Taux d\'oxygène (%)')
    temperature = models.FloatField(verbose_name='Température (°C)')
    pressure = models.FloatField(verbose_name='Pression (bar)')
    alert_level = models.CharField(
        max_length=20,
        choices=[
            ('normal', 'Normal'),
            ('warning', 'Attention'),
            ('danger', 'Danger'),
            ('critical', 'Critique'),
        ],
        default='normal',
        verbose_name='Niveau d\'alerte'
    )
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name='Date')
    class Meta:
        verbose_name = 'Donnée de toxicité'
        verbose_name_plural = 'Données de toxicité'
        ordering = ['-timestamp']
    def __str__(self):
        return f"Toxicité {self.timestamp.strftime('%d/%m/%Y %H:%M')} - {self.get_alert_level_display()}"
    @staticmethod
    def generate_random_data():
        sulfur = random.uniform(0, 100)
        if sulfur < 50:
            alert = 'normal'
        elif sulfur < 75:
            alert = 'warning'
        elif sulfur < 90:
            alert = 'danger'
        else:
            alert = 'critical'
        return ToxicityData.objects.create(
            sulfur_level=round(sulfur, 2),
            carbon_level=round(random.uniform(10, 40), 2),
            oxygen_level=round(random.uniform(15, 25), 2),
            temperature=round(random.uniform(15, 35), 2),
            pressure=round(random.uniform(0.9, 1.1), 2),
            alert_level=alert
        )
    def to_dict(self):
        return {
            'id': self.id,
            'sulfur_level': self.sulfur_level,
            'carbon_level': self.carbon_level,
            'oxygen_level': self.oxygen_level,
            'temperature': self.temperature,
            'pressure': self.pressure,
            'alert_level': self.alert_level,
            'alert_level_display': self.get_alert_level_display(),
            'timestamp': self.timestamp.isoformat()
        }
