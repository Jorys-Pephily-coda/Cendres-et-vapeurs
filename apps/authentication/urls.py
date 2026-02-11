from django.urls import path
from . import views
urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('verify-2fa/', views.verify_2fa_view, name='verify-2fa'),
    path('logout/', views.logout_view, name='logout'),
    path('refresh/', views.refresh_token_view, name='token-refresh'),
    path('me/', views.current_user_view, name='current-user'),
    path('me/update/', views.update_profile_view, name='update-profile'),
    path('change-password/', views.change_password_view, name='change-password'),
]
