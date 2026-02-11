
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
router = DefaultRouter()
router.register(r'toxicity', views.ToxicityDataViewSet, basename='toxicity')
urlpatterns = [
    path('toxicity/current/', views.current_toxicity, name='toxicity-current'),
    path('toxicity/generate/', views.generate_toxicity_data, name='toxicity-generate'),
    path('toxicity/stream/', views.toxicity_stream, name='toxicity-stream'),
    path('', include(router.urls)),
]
