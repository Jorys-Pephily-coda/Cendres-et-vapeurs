
from rest_framework import serializers
from .models import ActivityLog
class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'action_type', 'action_type_display',
            'description', 'timestamp'
        ]
        read_only_fields = ['id', 'user', 'user_name', 'timestamp']
    def get_user_name(self, obj):
        return obj.user.username if obj.user else 'Système'
