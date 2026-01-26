"""
Authentication views with rate limiting
"""
import logging
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from ..serializers import RegisterSerializer

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint
    Note: Rate limiting temporarily disabled until Redis is properly configured
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """Override create to add explicit logging"""
        from rest_framework.exceptions import ValidationError

        try:
            logger.info(f"📝 Registration attempt for: {request.data.get('username')}")
            response = super().create(request, *args, **kwargs)
            logger.info(f"✅ Registration successful for: {request.data.get('username')}")
            return response
        except ValidationError as e:
            # Validation errors (400) - let Django REST Framework handle them normally
            logger.warning(f"⚠️ Validation error during registration: {e.detail}")
            raise  # Re-raise to let DRF handle it
        except Exception as e:
            # Real server errors (500)
            logger.error(f"❌ Registration failed with server error: {e}", exc_info=True)
            return Response(
                {"error": "Une erreur s'est produite lors de l'inscription. Veuillez réessayer."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        photo_url = None
        if profile and profile.photo:
            photo_url = profile.photo.url
            # Si l'URL n'est pas déjà absolue (S3), construire l'URL complète
            if not photo_url.startswith(('http://', 'https://')):
                photo_url = request.build_absolute_uri(photo_url)

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.get_full_name(),
            "role": profile.role if profile else None,
            "pole": profile.pole.name if profile and profile.pole else None,
            "membre_specialite": profile.membre_specialite if profile else None,
            "description": profile.description if profile else None,
            "client_type": profile.client_type if profile else None,
            "photo_url": photo_url,
        })
