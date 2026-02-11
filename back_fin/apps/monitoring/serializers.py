
from rest_framework import serializers
from .models import ToxicityData
class ToxicityDataSerializer(serializers.ModelSerializer):
    alert_level_display = serializers.CharField(source='get_alert_level_display', read_only=True)
    class Meta:
        model = ToxicityData
        fields = [
            'id', 'sulfur_level', 'carbon_level', 'oxygen_level',
            'temperature', 'pressure', 'alert_level', 'alert_level_display',
            'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
