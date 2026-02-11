from django.contrib import admin
from .models import Product, ProductVote, PriceHistory
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'base_price', 'current_price', 'stock', 
                    'vote_count', 'is_active', 'created_at')
    list_filter = ('is_active', 'category', 'created_at')
    search_fields = ('name', 'description', 'category')
    readonly_fields = ('view_count', 'purchase_count', 'created_at', 'updated_at')
    fieldsets = (
        ('Informations générales', {
            'fields': ('name', 'description', 'category', 'image')
        }),
        ('Prix et stock', {
            'fields': ('base_price', 'current_price', 'stock')
        }),
        ('Statistiques', {
            'fields': ('view_count', 'purchase_count', 'is_active')
        }),
        ('Métadonnées', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )
@admin.register(ProductVote)
class ProductVoteAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('product__name', 'user__username')
@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'price', 'action', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('product__name',)
    readonly_fields = ('timestamp',)
