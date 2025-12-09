from django.shortcuts import render
from django.db.models import Q

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer, PoleSerializer, UserProfileSerializer,
    ProjetListSerializer, ProjetDetailSerializer, ProjetCreateUpdateSerializer,
    TacheSerializer, TacheCreateSerializer,
    DocumentSerializer
)
from .models import Profile, Pole, Projet, Tache, Document

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

class IsAdminUserProfile(permissions.BasePermission):
    """
    Autorise uniquement les users avec profile.role == 'admin'
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        profile = getattr(user, 'profile', None)
        return bool(profile and profile.role == 'admin')

class PoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pole.objects.all()
    serializer_class = PoleSerializer
    permission_classes = [IsAdminUserProfile]

class PoleListCreateView(generics.ListCreateAPIView):
    queryset = Pole.objects.all()
    serializer_class = PoleSerializer
    permission_classes = [IsAdminUserProfile]

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().select_related('profile', 'profile__pole')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUserProfile]


class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all().select_related('profile', 'profile__pole')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUserProfile]


# ===============================
# Permissions pour les projets
# ===============================

class CanViewProjet(permissions.BasePermission):
    """
    Permission pour voir les projets selon le rôle :
    - Admin : voit tout
    - Chef de pôle : voit les projets de son pôle
    - Membre/Stagiaire/Technicien : voient TOUS les projets (lecture universelle)
    - Artiste/Client/Partenaire : voient leurs propres projets
    """

    def has_permission(self, request, view):
        # Doit être authentifié
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return False

        # Admin voit tout
        if profile.role == 'admin':
            return True

        # Chef de pôle voit les projets de son pôle
        if profile.role == 'chef_pole' and profile.pole:
            return obj.pole == profile.pole

        # Membre/Stagiaire/Technicien voient TOUS les projets (lecture universelle)
        if profile.role in ['membre', 'stagiaire', 'technicien']:
            return True

        # Artiste/Client/Partenaire voient leurs propres projets
        if profile.role in ['artiste', 'client', 'partenaire']:
            return obj.client == user

        return False


class CanManageProjet(permissions.BasePermission):
    """
    Permission pour créer/modifier/supprimer les projets :
    - Admin : peut tout faire
    - Chef de pôle : peut gérer les projets de son pôle
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False

        # Admin et chef de pôle peuvent créer
        return profile.role in ['admin', 'chef_pole']

    def has_object_permission(self, request, view, obj):
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return False

        # Admin peut tout modifier/supprimer
        if profile.role == 'admin':
            return True

        # Chef de pôle peut gérer les projets de son pôle
        if profile.role == 'chef_pole' and profile.pole:
            return obj.pole == profile.pole

        return False


# ===============================
# Vues pour les projets
# ===============================

class ProjetListCreateView(generics.ListCreateAPIView):
    """
    GET: Liste les projets selon les permissions de l'utilisateur
    POST: Crée un nouveau projet (admin ou chef de pôle)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjetCreateUpdateSerializer
        return ProjetListSerializer

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return Projet.objects.none()

        # Admin voit tout
        if profile.role == 'admin':
            return Projet.objects.all().select_related('pole', 'client', 'chef_projet').prefetch_related('membres')

        # Chef de pôle voit les projets de son pôle
        if profile.role == 'chef_pole' and profile.pole:
            return Projet.objects.filter(pole=profile.pole).select_related('pole', 'client', 'chef_projet').prefetch_related('membres')

        # Membre/Stagiaire/Technicien voient TOUS les projets (lecture universelle)
        if profile.role in ['membre', 'stagiaire', 'technicien']:
            return Projet.objects.all().select_related('pole', 'client', 'chef_projet').prefetch_related('membres')

        # Artiste/Client/Partenaire voient leurs propres projets
        if profile.role in ['artiste', 'client', 'partenaire']:
            return Projet.objects.filter(client=user).select_related('pole', 'client', 'chef_projet').prefetch_related('membres')

        return Projet.objects.none()

    def perform_create(self, serializer):
        # Vérifier que l'utilisateur a le droit de créer
        profile = getattr(self.request.user, 'profile', None)
        if not profile or profile.role not in ['admin', 'chef_pole']:
            return Response(
                {"detail": "Vous n'avez pas la permission de créer un projet"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()


class ProjetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Récupère les détails d'un projet
    PUT/PATCH: Modifie un projet (admin ou chef de pôle du pôle concerné)
    DELETE: Supprime un projet (admin ou chef de pôle du pôle concerné)
    """
    queryset = Projet.objects.all().select_related('pole', 'client', 'chef_projet').prefetch_related('membres', 'taches', 'documents')
    permission_classes = [permissions.IsAuthenticated, CanViewProjet]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProjetCreateUpdateSerializer
        return ProjetDetailSerializer

    def update(self, request, *args, **kwargs):
        # Vérifier les permissions de modification
        instance = self.get_object()
        can_manage = CanManageProjet()
        if not can_manage.has_object_permission(request, self, instance):
            return Response(
                {"detail": "Vous n'avez pas la permission de modifier ce projet"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        # Vérifier les permissions de suppression
        instance = self.get_object()
        can_manage = CanManageProjet()
        if not can_manage.has_object_permission(request, self, instance):
            return Response(
                {"detail": "Vous n'avez pas la permission de supprimer ce projet"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


# ===============================
# Permissions pour les tâches
# ===============================

class CanManageTache(permissions.BasePermission):
    """
    Permission pour gérer les tâches :
    - Admin et Chef de pôle : peuvent tout faire
    - Membre/Stagiaire/Technicien : peuvent uniquement modifier le statut de leurs propres tâches
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return False

        # Admin peut tout faire
        if profile.role == 'admin':
            return True

        # Chef de pôle peut gérer les tâches de son pôle
        if profile.role == 'chef_pole' and profile.pole:
            return obj.projet.pole == profile.pole

        # Membre/Stagiaire/Technicien peuvent modifier uniquement leurs propres tâches
        # Et seulement pour mettre à jour le statut (pas créer/supprimer)
        if profile.role in ['membre', 'stagiaire', 'technicien']:
            if request.method in ['PUT', 'PATCH']:
                # Vérifier que la tâche leur est assignée
                return obj.assigne_a == user
            # Ne peuvent pas créer ou supprimer
            return False

        return False


# ===============================
# Vues pour les tâches
# ===============================

class TacheListCreateView(generics.ListCreateAPIView):
    """
    GET: Liste les tâches (filtrées par projet si ?projet=<id>)
    POST: Crée une nouvelle tâche
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TacheCreateSerializer
        return TacheSerializer

    def get_queryset(self):
        queryset = Tache.objects.all().select_related('projet', 'assigne_a')

        # Filtrer par projet si demandé
        projet_id = self.request.query_params.get('projet')
        if projet_id:
            queryset = queryset.filter(projet_id=projet_id)

        # Filtrer par utilisateur assigné si demandé
        assigne_a = self.request.query_params.get('assigne_a')
        if assigne_a:
            queryset = queryset.filter(assigne_a_id=assigne_a)

        # Filtrer par statut si demandé
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)

        return queryset


class TacheDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Récupère les détails d'une tâche
    PUT/PATCH: Modifie une tâche (selon permissions)
    DELETE: Supprime une tâche (selon permissions)
    """
    queryset = Tache.objects.all().select_related('projet', 'assigne_a')
    permission_classes = [permissions.IsAuthenticated, CanManageTache]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TacheCreateSerializer
        return TacheSerializer

    def update(self, request, *args, **kwargs):
        # Pour les membres/stagiaires/techniciens, limiter la modification au statut uniquement
        instance = self.get_object()
        profile = getattr(request.user, 'profile', None)

        if profile and profile.role in ['membre', 'stagiaire', 'technicien']:
            # Autoriser uniquement la modification du statut
            allowed_fields = {'statut'}
            request_fields = set(request.data.keys())

            if not request_fields.issubset(allowed_fields):
                return Response(
                    {"detail": "Vous ne pouvez modifier que le statut de vos tâches"},
                    status=status.HTTP_403_FORBIDDEN
                )

        return super().update(request, *args, **kwargs)


# ===============================
# Vues pour les documents
# ===============================

class DocumentListCreateView(generics.ListCreateAPIView):
    """
    GET: Liste les documents (filtrés par projet si ?projet=<id>)
    POST: Upload un nouveau document
    """
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = Document.objects.all().select_related('projet', 'uploade_par')

        # Filtrer par projet si demandé
        projet_id = self.request.query_params.get('projet')
        if projet_id:
            queryset = queryset.filter(projet_id=projet_id)

        return queryset

    def perform_create(self, serializer):
        # Associer l'utilisateur connecté comme uploadeur
        serializer.save(uploade_par=self.request.user)


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Récupère les détails d'un document
    PUT/PATCH: Modifie un document
    DELETE: Supprime un document
    """
    queryset = Document.objects.all().select_related('projet', 'uploade_par')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
