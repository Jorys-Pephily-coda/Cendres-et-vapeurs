from django.contrib import admin
from .models import CalendarEvent, ShiftNote
@admin.register(CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'priority', 'is_all_day', 'created_by')
    list_filter = ('priority', 'is_all_day', 'start_date')
    search_fields = ('title', 'description', 'location')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Informations générales', {
            'fields': ('title', 'description', 'location')
        }),
        ('Date et heure', {
            'fields': ('start_date', 'end_date', 'is_all_day')
        }),
        ('Priorité', {
            'fields': ('priority',)
        }),
        ('Métadonnées', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )
@admin.register(ShiftNote)
class ShiftNoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'shift', 'is_important', 'created_at')
    list_filter = ('shift', 'is_important', 'date')
    search_fields = ('user__username', 'content')
    readonly_fields = ('created_at', 'updated_at')
