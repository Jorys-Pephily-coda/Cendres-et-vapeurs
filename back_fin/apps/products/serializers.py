
from rest_framework import serializers
from .models import Product, ProductVote, PriceHistory
class ProductSerializer(serializers.ModelSerializer):
    vote_count = serializers.IntegerField(read_only=True)
    price_trend = serializers.CharField(read_only=True)
    has_voted = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'base_price', 'current_price',
            'stock', 'image', 'category', 'is_active', 'vote_count',
            'price_trend', 'has_voted', 'view_count', 'purchase_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_price', 'view_count', 'purchase_count', 
                           'created_at', 'updated_at']
    def get_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ProductVote.objects.filter(product=obj, user=request.user).exists()
        return False
class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'base_price', 'stock',
            'image', 'category', 'is_active'
        ]
class ProductVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVote
        fields = ['id', 'product', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = ['id', 'product', 'price', 'action', 'timestamp']
        read_only_fields = ['id', 'timestamp']
