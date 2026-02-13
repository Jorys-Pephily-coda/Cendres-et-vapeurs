from django.contrib import admin
from .models import ToxicityData
@admin.register(ToxicityData)
class ToxicityDataAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'sulfur_level', 'alert_level', 'temperature', 'pressure')
    list_filter = ('alert_level', 'timestamp')
    readonly_fields = ('timestamp',)
    
    def has_add_permission(self, request):
        return False
