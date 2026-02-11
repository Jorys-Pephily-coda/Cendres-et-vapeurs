from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import User, TwoFactorToken
from .serializers import (
    RegisterSerializer, LoginSerializer, Verify2FASerializer,
    UserSerializer, ChangePasswordSerializer, UpdateUserSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'Inscription réussie. Votre rôle initial est Invité.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    user = authenticate(username=username, password=password)

    if user is None:
        return Response({
            'error': 'Identifiants invalides'
        }, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({
            'error': 'Compte désactivé'
        }, status=status.HTTP_403_FORBIDDEN)

    if user.is_2fa_enabled:
        token_2fa = TwoFactorToken.objects.create(user=user)

        try:
            send_mail(
                subject='[Cendres et Vapeur] Code de vérification 2FA',
                message=f'Votre code de vérification est : {token_2fa.code}\n\n'
                        f'Ce code expire dans 10 minutes.\n\n'
                        f'Si vous n\'avez pas demandé ce code, ignorez cet email.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({
                'error': 'Erreur lors de l\'envoi de l\'email',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'message': 'Code 2FA envoyé par email',
            'requires_2fa': True,
            'username': username
        }, status=status.HTTP_200_OK)

    refresh = RefreshToken.for_user(user)

    response = Response({
        'message': 'Connexion réussie',
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)

    response.set_cookie(
        key='access_token',
        value=str(refresh.access_token),
        max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Lax'
    )

    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Lax'
    )

    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_2fa_view(request):
    serializer = Verify2FASerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    username = serializer.validated_data['username']
    code = serializer.validated_data['code']

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({
            'error': 'Utilisateur introuvable'
        }, status=status.HTTP_404_NOT_FOUND)

    token_2fa = TwoFactorToken.objects.filter(
        user=user,
        code=code,
        is_used=False,
        expires_at__gt=timezone.now()
    ).first()

    if not token_2fa:
        return Response({
            'error': 'Code invalide ou expiré'
        }, status=status.HTTP_401_UNAUTHORIZED)

    token_2fa.is_used = True
    token_2fa.save()

    refresh = RefreshToken.for_user(user)

    response = Response({
        'message': 'Authentification réussie',
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)

    response.set_cookie(
        key='access_token',
        value=str(refresh.access_token),
        max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Lax'
    )

    response.set_cookie(
        key='refresh_token',
        value=str(refresh),
        max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Lax'
    )

    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'Profil mis à jour',
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = request.user

    if not user.check_password(serializer.validated_data['old_password']):
        return Response({
            'error': 'Ancien mot de passe incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data['new_password'])
    user.save()

    return Response({
        'message': 'Mot de passe modifié avec succès'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    response = Response({
        'message': 'Déconnexion réussie'
    }, status=status.HTTP_200_OK)

    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')

    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    refresh_token = request.COOKIES.get('refresh_token')

    if not refresh_token:
        return Response({
            'error': 'Refresh token manquant'
        }, status=status.HTTP_401_UNAUTHORIZED)

    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)

        response = Response({
            'message': 'Token rafraîchi'
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            key='access_token',
            value=access_token,
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax'
        )

        return response

    except Exception as e:
        return Response({
            'error': 'Token invalide ou expiré',
            'detail': str(e)
        }, status=status.HTTP_401_UNAUTHORIZED)
