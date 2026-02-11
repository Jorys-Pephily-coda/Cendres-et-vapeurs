from django.urls import path
from . import views_users
urlpatterns = [
    path('', views_users.UserListView.as_view(), name='user-list'),
    path('<int:pk>/', views_users.UserDetailView.as_view(), name='user-detail'),
]
