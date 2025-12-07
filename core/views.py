from django.shortcuts import render

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer
from .models import Profile

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.get_full_name(),
            "role": profile.role if profile else None,
            "pole": profile.pole.name if profile and profile.pole else None,
            "client_type": profile.client_type if profile else None,
        })

