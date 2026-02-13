from rest_framework import serializers
from .models import CalendarEvent, ShiftNote
class CalendarEventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date',
            'priority', 'is_all_day', 'location', 'created_by',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_by_name', 'created_at', 'updated_at']
    def get_created_by_name(self, obj):
        return obj.created_by.username if obj.created_by else None
    
    
class ShiftNoteSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    shift_display = serializers.CharField(source='get_shift_display', read_only=True)
    class Meta:
        model = ShiftNote
        fields = [
            'id', 'user', 'user_name', 'date', 'shift', 'shift_display',
            'content', 'is_important', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_name', 'created_at', 'updated_at']
    def get_user_name(self, obj):
        return obj.user.username
