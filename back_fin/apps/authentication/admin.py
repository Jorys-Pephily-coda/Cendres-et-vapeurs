from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, TwoFactorToken
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'is_2fa_enabled')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Informations Zone Franche', {'fields': ('role', 'is_2fa_enabled')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Informations Zone Franche', {'fields': ('role', 'email', 'is_2fa_enabled')}),
    )
@admin.register(TwoFactorToken)
class TwoFactorTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'created_at', 'expires_at', 'is_used')
    list_filter = ('is_used', 'created_at')
    search_fields = ('user__username', 'code')
    readonly_fields = ('created_at', 'expires_at')
