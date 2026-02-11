from rest_framework import serializers
from .models import Cart, CartItem, DiscountCode, Order, OrderItem
from apps.products.serializers import ProductSerializer
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'subtotal', 'added_at']
        read_only_fields = ['id', 'subtotal', 'added_at']
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    items_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total', 'items_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'total', 'items_count', 'created_at', 'updated_at']
class DiscountCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscountCode
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'min_purchase', 'max_uses', 'uses_count', 'is_active',
            'valid_from', 'valid_until', 'created_at'
        ]
        read_only_fields = ['id', 'uses_count', 'created_at']
class ValidateDiscountSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_price',
            'quantity', 'subtotal'
        ]
        read_only_fields = ['id', 'product_name', 'product_price', 'subtotal']
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'status', 'subtotal',
            'discount_code', 'discount_amount', 'total', 'notes',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'subtotal', 'discount_amount',
            'total', 'created_at', 'updated_at'
        ]
class CreateOrderSerializer(serializers.Serializer):
    discount_code = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
