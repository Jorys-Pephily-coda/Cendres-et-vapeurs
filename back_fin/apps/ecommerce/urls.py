from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
router = DefaultRouter()
router.register(r'discounts', views.DiscountCodeViewSet, basename='discount')
router.register(r'orders', views.OrderViewSet, basename='order')
urlpatterns = [
    path('stripe/', include('apps.ecommerce.stripeurls')),
    path('cart/', views.get_cart, name='cart'),
    path('cart/add/', views.add_to_cart, name='cart-add'),
    path('cart/<int:item_id>/', views.update_cart_item, name='cart-update'),
    path('cart/<int:item_id>/remove/', views.remove_from_cart, name='cart-remove'),
    path('cart/clear/', views.clear_cart, name='cart-clear'),
    path('discounts/validate/', views.validate_discount_code, name='discount-validate'),
    path('orders/create/', views.create_order, name='order-create'),
    path('', include(router.urls)),
]
