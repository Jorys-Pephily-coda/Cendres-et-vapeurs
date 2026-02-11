from django.contrib import admin
from .models import ChatMessage
@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'message_preview', 'is_system', 'created_at')
    list_filter = ('is_system', 'created_at')
    search_fields = ('user__username', 'message')
    readonly_fields = ('created_at',)
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'
