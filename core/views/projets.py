"""
Projet-related views
"""
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from ..models import Projet
from ..serializers import (
    ProjetListSerializer,
    ProjetDetailSerializer,
    ProjetCreateUpdateSerializer
)
from ..permissions import CanViewProjet, CanManageProjet
from ..utils.helpers import is_admin_or_super


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

        queryset = Projet.objects.all().select_related(
            'pole', 'client', 'chef_projet', 'created_by'
        ).prefetch_related('membres')

        # Admin et Super Admin voient tout (tous les statuts)
        if is_admin_or_super(profile):
            return queryset

        # Les projets créés par l'utilisateur (tous les statuts)
        projets_crees = Q(created_by=user)

        # TOUS les projets publics (en_cours, en_revision, termine, annule) sont visibles par TOUS
        projets_publics = Q(statut__in=['en_cours', 'en_revision', 'termine', 'annule'])

        # Tous les utilisateurs : projets créés + TOUS les projets publics
        return queryset.filter(projets_crees | projets_publics).distinct()

    def perform_create(self, serializer):
        # Vérifier que l'utilisateur a le droit de créer
        profile = getattr(self.request.user, 'profile', None)
        if not profile or (not is_admin_or_super(profile) and profile.role != 'chef_pole'):
            return Response(
                {"detail": "Vous n'avez pas la permission de créer un projet"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Logique de statut automatique
        statut = serializer.validated_data.get('statut', 'brouillon')

        # Si créé par admin/super_admin et statut est brouillon ou en_attente, passer directement à en_cours
        if is_admin_or_super(profile) and statut in ['brouillon', 'en_attente']:
            statut = 'en_cours'

        # Sauvegarder avec created_by et statut ajusté
        serializer.save(created_by=self.request.user, statut=statut)


class ProjetDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Récupère les détails d'un projet
    PUT/PATCH: Modifie un projet (admin ou chef de pôle du pôle concerné)
    DELETE: Supprime un projet (admin ou chef de pôle du pôle concerné)
    """
    queryset = Projet.objects.all().select_related(
        'pole', 'client', 'chef_projet'
    ).prefetch_related('membres', 'taches', 'documents')
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

        # Restriction sur les statuts pour les créateurs non-admin
        user = request.user
        profile = getattr(user, 'profile', None)
        new_statut = request.data.get('statut')

        # Si le statut est modifié et que l'utilisateur n'est pas admin/super_admin
        if new_statut and not is_admin_or_super(profile):
            # Les créateurs non-admin ne peuvent mettre que "brouillon" ou "en_attente"
            if new_statut not in ['brouillon', 'en_attente']:
                return Response(
                    {"detail": "Vous ne pouvez mettre le projet qu'en statut 'brouillon' ou 'en_attente'. Seuls les administrateurs peuvent changer vers d'autres statuts."},
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


class ProjetUpdateStatutView(APIView):
    """
    Endpoint pour changer le statut d'un projet
    Permissions:
    - Admin: peut changer n'importe quel statut
    - Créateur du projet: peut changer le statut
    - Chef de pôle: peut changer le statut des projets de son pôle
    - Chef de projet: peut mettre en_revision, termine, annule
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            projet = Projet.objects.select_related('pole', 'created_by', 'chef_projet').get(pk=pk)
        except Projet.DoesNotExist:
            return Response(
                {"detail": "Projet introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return Response(
                {"detail": "Profil utilisateur non trouvé"},
                status=status.HTTP_403_FORBIDDEN
            )

        nouveau_statut = request.data.get('statut')

        if not nouveau_statut:
            return Response(
                {"detail": "Le champ 'statut' est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier les permissions selon le rôle
        can_change = False

        # Admin et Super Admin peuvent tout faire
        if is_admin_or_super(profile):
            can_change = True

        # Créateur du projet peut changer le statut
        elif projet.created_by == user:
            can_change = True

        # Chef de pôle peut changer le statut des projets de son pôle
        elif profile.role == 'chef_pole' and profile.pole and projet.pole == profile.pole:
            can_change = True

        # Chef de projet peut mettre en_revision, termine, annule
        elif projet.chef_projet == user:
            if nouveau_statut in ['en_revision', 'termine', 'annule']:
                can_change = True

        if not can_change:
            return Response(
                {"detail": "Vous n'avez pas la permission de modifier le statut de ce projet"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Changer le statut
        projet.statut = nouveau_statut
        projet.save()

        # Retourner le projet mis à jour
        serializer = ProjetDetailSerializer(projet)
        return Response(serializer.data)


class ProjetAcceptChefView(APIView):
    """
    Endpoint pour accepter la désignation comme chef de projet
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            projet = Projet.objects.select_related('chef_projet').get(pk=pk)
        except Projet.DoesNotExist:
            return Response(
                {"detail": "Projet introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        # Vérifier que l'utilisateur est bien le chef de projet désigné
        if projet.chef_projet != user:
            return Response(
                {"detail": "Vous n'êtes pas le chef de projet désigné pour ce projet"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifier que le statut est en attente
        if projet.chef_projet_status == 'accepted':
            return Response(
                {"detail": "Vous avez déjà accepté ce projet"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if projet.chef_projet_status == 'declined':
            return Response(
                {"detail": "Vous avez déjà refusé ce projet"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Accepter
        projet.chef_projet_status = 'accepted'
        projet.save()

        # Retourner le projet mis à jour
        serializer = ProjetDetailSerializer(projet)
        return Response(serializer.data)


class ProjetDeclineChefView(APIView):
    """
    Endpoint pour refuser la désignation comme chef de projet
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            projet = Projet.objects.select_related('chef_projet').get(pk=pk)
        except Projet.DoesNotExist:
            return Response(
                {"detail": "Projet introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

        user = request.user

        # Vérifier que l'utilisateur est bien le chef de projet désigné
        if projet.chef_projet != user:
            return Response(
                {"detail": "Vous n'êtes pas le chef de projet désigné pour ce projet"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérifier que le statut est en attente
        if projet.chef_projet_status == 'accepted':
            return Response(
                {"detail": "Vous avez déjà accepté ce projet, vous ne pouvez plus refuser"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if projet.chef_projet_status == 'declined':
            return Response(
                {"detail": "Vous avez déjà refusé ce projet"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Refuser
        projet.chef_projet_status = 'declined'
        projet.save()

        # Retourner le projet mis à jour
        serializer = ProjetDetailSerializer(projet)
        return Response(serializer.data)
