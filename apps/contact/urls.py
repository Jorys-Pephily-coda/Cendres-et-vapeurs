from django.urls import path
from . import views
urlpatterns = [
    path('send/', views.send_contact_message, name='contact-send'),
]
