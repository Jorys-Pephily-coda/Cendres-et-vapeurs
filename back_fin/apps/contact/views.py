from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def send_contact_message(request):
    serializer = ContactMessageSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    message = serializer.save()
    
    try:
        email_body = f"""
Nouveau message de contact reçu :

Nom : {message.name}
Email : {message.email}
Sujet : {message.subject}

Message :
{message.message}

---
Envoyé depuis le Bureau de Poste - Cendres et Vapeur
        """
        
        send_mail(
            subject=f'[Cendres et Vapeur] Contact: {message.subject}',
            message=email_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.DEFAULT_FROM_EMAIL],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Error sending contact email: {e}")
    
    return Response({
        'message': 'Votre message a été envoyé avec succès',
        'data': serializer.data
    }, status=status.HTTP_201_CREATED)