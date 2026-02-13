from django.contrib import admin
from .models import ActivityLog
@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'user', 'action_type', 'description_preview', 'ip_address')
    list_filter = ('action_type', 'timestamp')
    search_fields = ('user__username', 'description', 'ip_address')
    readonly_fields = ('timestamp',)

    def description_preview(self, obj):
        return obj.description[:100] + '...' if len(obj.description) > 100 else obj.description
    description_preview.short_description = 'Description'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
