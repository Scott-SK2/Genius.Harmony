"""
Authentication views with rate limiting
"""
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from ..serializers import RegisterSerializer


@method_decorator(ratelimit(key='ip', rate='5/h', method='POST'), name='dispatch')
class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint with rate limiting
    Limited to 5 registrations per hour per IP
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


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
