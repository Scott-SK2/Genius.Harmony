"""
Tache-related views
"""
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from ..models import Tache, Projet
from ..serializers import TacheSerializer, TacheCreateSerializer
from ..permissions import CanCreateTache, CanManageTache
from ..utils.helpers import is_admin_or_super


class TacheListCreateView(generics.ListCreateAPIView):
    """
    GET: Liste les tâches (filtrées par projet si ?projet=<id>)
    POST: Crée une nouvelle tâche
    """
    permission_classes = [CanCreateTache]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TacheCreateSerializer
        return TacheSerializer

    def get_queryset(self):
        user = self.request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return Tache.objects.none()

        queryset = Tache.objects.all().select_related(
            'projet', 'projet__pole', 'projet__chef_projet'
        ).prefetch_related('assigne_a')

        # Admin et Super Admin voient toutes les tâches
        if is_admin_or_super(profile):
            pass  # Pas de filtre supplémentaire

        # Chef de pôle voit les tâches des projets de son pôle
        elif profile.role == 'chef_pole' and profile.pole:
            queryset = queryset.filter(projet__pole=profile.pole)

        # Autres utilisateurs voient :
        # - Les tâches des projets dont ils sont membres
        # - Les tâches des projets dont ils sont chef de projet
        # - Les tâches qui leur sont assignées
        else:
            queryset = queryset.filter(
                Q(projet__membres=user) |
                Q(projet__chef_projet=user) |
                Q(assigne_a=user)
            ).distinct()

        # Filtrer par projet si demandé
        projet_id = self.request.query_params.get('projet')
        if projet_id:
            queryset = queryset.filter(projet_id=projet_id)

        # Filtrer par utilisateur assigné si demandé
        assigne_a = self.request.query_params.get('assigne_a')
        if assigne_a:
            queryset = queryset.filter(assigne_a=assigne_a)

        # Filtrer par statut si demandé
        statut = self.request.query_params.get('statut')
        if statut:
            queryset = queryset.filter(statut=statut)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        profile = getattr(user, 'profile', None)
        projet_id = serializer.validated_data.get('projet').id

        # Récupérer le projet pour vérifier les permissions
        try:
            projet = Projet.objects.get(id=projet_id)
        except Projet.DoesNotExist:
            raise PermissionDenied("Projet introuvable")

        # Admin, super_admin et chef_pole peuvent créer
        if profile.role in ['admin', 'super_admin', 'chef_pole']:
            serializer.save()
            return

        # Chef de projet peut créer seulement s'il a accepté
        if projet.chef_projet == user and projet.chef_projet_status == 'accepted':
            serializer.save()
            return

        # Sinon, refuser
        raise PermissionDenied("Vous n'avez pas la permission de créer une tâche dans ce projet")


class TacheDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Récupère les détails d'une tâche
    PUT/PATCH: Modifie une tâche (selon permissions)
    DELETE: Supprime une tâche (selon permissions)
    """
    queryset = Tache.objects.all().select_related('projet').prefetch_related('assigne_a')
    permission_classes = [permissions.IsAuthenticated, CanManageTache]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TacheCreateSerializer
        return TacheSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return Response(
                {"detail": "Profil utilisateur non trouvé"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Si c'est la personne assignée (mais pas admin, super_admin, chef de pôle ou chef de projet)
        # alors elle peut seulement modifier le statut
        is_assigned = instance.assigne_a.filter(id=user.id).exists()
        is_admin = is_admin_or_super(profile)
        is_chef_pole = profile.role == 'chef_pole' and profile.pole and instance.projet.pole == profile.pole
        is_chef_projet = instance.projet.chef_projet == user

        if is_assigned and not (is_admin or is_chef_pole or is_chef_projet):
            # Autoriser uniquement la modification du statut
            allowed_fields = {'statut'}
            request_fields = set(request.data.keys())

            if not request_fields.issubset(allowed_fields):
                return Response(
                    {"detail": "Vous ne pouvez modifier que le statut de vos tâches"},
                    status=status.HTTP_403_FORBIDDEN
                )

        return super().update(request, *args, **kwargs)
