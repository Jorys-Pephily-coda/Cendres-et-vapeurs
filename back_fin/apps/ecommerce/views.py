from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from decimal import Decimal
from .models import Cart, CartItem, DiscountCode, Order, OrderItem
from .serializers import (
    CartSerializer, CartItemSerializer, DiscountCodeSerializer,
    ValidateDiscountSerializer, OrderSerializer, CreateOrderSerializer
)
from apps.products.models import Product
from apps.authentication.permissions import IsAdminUser, IsUserOrAbove
from .invoice import generate_invoice_pdf


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    if not product_id:
        return Response({
            'error': 'product_id requis'
        }, status=status.HTTP_400_BAD_REQUEST)
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({
            'error': 'Produit introuvable'
        }, status=status.HTTP_404_NOT_FOUND)
    if product.stock < quantity:
        return Response({
            'error': f'Stock insuffisant. Disponible: {product.stock}'
        }, status=status.HTTP_400_BAD_REQUEST)
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_item, item_created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': quantity}
    )
    if not item_created:
        cart_item.quantity += quantity
        if cart_item.quantity > product.stock:
            return Response({
                'error': f'Stock insuffisant. Disponible: {product.stock}'
            }, status=status.HTTP_400_BAD_REQUEST)
        cart_item.save()
    serializer = CartSerializer(cart)
    return Response({
        'message': 'Produit ajouté au panier',
        'cart': serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    cart = get_object_or_404(Cart, user=request.user)
    cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
    quantity = request.data.get('quantity')
    if quantity is None or quantity < 1:
        return Response({
            'error': 'Quantité invalide'
        }, status=status.HTTP_400_BAD_REQUEST)
    if quantity > cart_item.product.stock:
        return Response({
            'error': f'Stock insuffisant. Disponible: {cart_item.product.stock}'
        }, status=status.HTTP_400_BAD_REQUEST)
    cart_item.quantity = quantity
    cart_item.save()
    serializer = CartSerializer(cart)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    cart = get_object_or_404(Cart, user=request.user)
    cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
    cart_item.delete()
    serializer = CartSerializer(cart)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    cart = get_object_or_404(Cart, user=request.user)
    cart.items.all().delete()
    return Response({
        'message': 'Panier vidé'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_discount_code(request):
    serializer = ValidateDiscountSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    code = serializer.validated_data['code']
    total = serializer.validated_data['total']
    try:
        discount = DiscountCode.objects.get(code=code.upper())
    except DiscountCode.DoesNotExist:
        return Response({
            'error': 'Code promo invalide'
        }, status=status.HTTP_404_NOT_FOUND)
    if not discount.is_valid(total):
        return Response({
            'error': 'Code promo non valide (expiré, utilisations maximales atteintes, ou montant minimum non atteint)'
        }, status=status.HTTP_400_BAD_REQUEST)
    discount_amount = discount.calculate_discount(total)
    return Response({
        'valid': True,
        'discount_amount': discount_amount,
        'new_total': total - discount_amount,
        'discount': DiscountCodeSerializer(discount).data
    })


class DiscountCodeViewSet(viewsets.ModelViewSet):
    queryset = DiscountCode.objects.all()
    serializer_class = DiscountCodeSerializer
    permission_classes = [IsAdminUser]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    serializer = CreateOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        cart = Cart.objects.get(user=request.user)
    except Cart.DoesNotExist:
        return Response({
            'error': 'Panier vide'
        }, status=status.HTTP_400_BAD_REQUEST)
    if not cart.items.exists():
        return Response({
            'error': 'Panier vide'
        }, status=status.HTTP_400_BAD_REQUEST)
    for item in cart.items.all():
        if item.quantity > item.product.stock:
            return Response({
                'error': f'Stock insuffisant pour {item.product.name}'
            }, status=status.HTTP_400_BAD_REQUEST)
    subtotal = cart.total
    discount_code_obj = None
    discount_amount = Decimal('0')
    discount_code = serializer.validated_data.get('discount_code', '').strip()
    if discount_code:
        try:
            discount_code_obj = DiscountCode.objects.get(code=discount_code.upper())
            if not discount_code_obj.is_valid(subtotal):
                return Response({
                    'error': 'Code promo non valide'
                }, status=status.HTTP_400_BAD_REQUEST)
            discount_amount = discount_code_obj.calculate_discount(subtotal)
        except DiscountCode.DoesNotExist:
            return Response({
                'error': 'Code promo invalide'
            }, status=status.HTTP_404_NOT_FOUND)
    total = subtotal - discount_amount
    with transaction.atomic():
        order = Order.objects.create(
            user=request.user,
            order_number=Order.generate_order_number(),
            status='pending',
            subtotal=subtotal,
            discount_code=discount_code_obj,
            discount_amount=discount_amount,
            total=total,
            notes=serializer.validated_data.get('notes', '')
        )
        for cart_item in cart.items.all():
            cart_item.product.fluctuate_price(action='purchase')
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                product_price=cart_item.product.current_price,
                quantity=cart_item.quantity,
                subtotal=cart_item.subtotal
            )
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save()
        if discount_code_obj:
            discount_code_obj.uses_count += 1
            discount_code_obj.save()
        cart.items.all().delete()
    return Response({
        'message': 'Commande créée avec succès',
        'order': OrderSerializer(order).data
    }, status=status.HTTP_201_CREATED)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Order.objects.all()
        return Order.objects.filter(user=user)
    @action(detail=True, methods=['get'])
    def invoice(self, request, pk=None):
        order = self.get_object()
        pdf_buffer = generate_invoice_pdf(order)
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="facture_{order.order_number}.pdf"'
        return response
