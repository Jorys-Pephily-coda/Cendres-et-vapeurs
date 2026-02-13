from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Order
import stripe


def _ensure_stripe_configured():
    stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
    if not stripe.api_key:
        raise RuntimeError("STRIPE_SECRET_KEY n'est pas configuré")


def _to_unit_amount_cents(amount):
    """Convertit un Decimal/float 'euros' en int centimes pour Stripe."""
    try:
        return int(round(float(amount) * 100))
    except Exception:
        return None


def _build_line_items_from_order(order: Order):
    line_items = []
    for item in order.items.all():
        unit_amount = _to_unit_amount_cents(item.product_price)
        if unit_amount is None or unit_amount < 1:
            continue
        line_items.append(
            {
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': item.product_name,
                    },
                    'unit_amount': unit_amount,
                },
                'quantity': int(item.quantity),
            }
        )

    if not line_items:
        unit_amount = _to_unit_amount_cents(order.total)
        if unit_amount is None or unit_amount < 1:
            raise ValueError('Total de commande invalide')
        line_items = [
            {
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': f'Commande {order.order_number}',
                    },
                    'unit_amount': unit_amount,
                },
                'quantity': 1,
            }
        ]

    return line_items

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_stripe_checkout_session(request):
    try:
        _ensure_stripe_configured()
        data = request.data

        order_id = data.get('order_id')
        if order_id is not None:
            order = Order.objects.filter(pk=order_id, user=request.user).prefetch_related('items').first()
            if not order:
                return Response({'error': 'Commande introuvable'}, status=status.HTTP_404_NOT_FOUND)
            line_items = _build_line_items_from_order(order)
        else:
            line_items = data.get('line_items')
            if not isinstance(line_items, list) or len(line_items) == 0:
                return Response(
                    {'error': "Fournis soit 'order_id' soit 'line_items'"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        front_url = getattr(settings, 'FRONT_URL', 'http://localhost:5173')
        success_url = data.get('success_url') or f"{front_url}/success"
        cancel_url = data.get('cancel_url') or f"{front_url}/cancel"

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=str(order_id) if order_id is not None else None,
            metadata={'order_id': str(order_id)} if order_id is not None else {},
        )
        return Response({'id': session.id, 'url': session.url})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
    if not endpoint_secret:
        return HttpResponse('STRIPE_WEBHOOK_SECRET non configuré', status=500)
    if not sig_header:
        return HttpResponse('Stripe-Signature manquant', status=400)
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        order_id = None
        metadata = session.get('metadata') if isinstance(session, dict) else None
        if isinstance(metadata, dict):
            order_id = metadata.get('order_id')

        if not order_id:
            order_id = session.get('client_reference_id') if isinstance(session, dict) else None

        if order_id:
            order = Order.objects.filter(pk=order_id).first()
            if order:
                payment_status = session.get('payment_status') if isinstance(session, dict) else None
                if order.status == 'pending' and (payment_status in (None, 'paid')):
                    order.status = 'confirmed'
                    order.save(update_fields=['status', 'updated_at'])
        

    return HttpResponse(status=200)