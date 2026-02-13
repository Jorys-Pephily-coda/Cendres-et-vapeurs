from django.urls import path

from . import stripeviews


urlpatterns = [
	path('create-checkout-session/', stripeviews.create_stripe_checkout_session, name='stripe-create-checkout-session'),
	path('webhook/', stripeviews.stripe_webhook, name='stripe-webhook'),
]

