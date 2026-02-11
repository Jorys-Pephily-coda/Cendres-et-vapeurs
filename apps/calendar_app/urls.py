from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
router = DefaultRouter()
router.register(r'events', views.CalendarEventViewSet, basename='event')
router.register(r'notes', views.ShiftNoteViewSet, basename='shift-note')
urlpatterns = [
    path('', include(router.urls)),
]
