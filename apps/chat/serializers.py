from rest_framework import serializers
from .models import ChatMessage
class ChatMessageSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'user_name', 'user_role', 'message', 'is_system', 'created_at']
        read_only_fields = ['id', 'user', 'user_name', 'user_role', 'created_at']
