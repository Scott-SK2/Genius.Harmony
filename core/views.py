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


class UserProfileDetailView(APIView):
    """
    Vue pour récupérer le profil complet d'un utilisateur avec tous ses projets et tâches
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            user = User.objects.select_related('profile', 'profile__pole').get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        # Informations de base
        profile = getattr(user, 'profile', None)
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": profile.role if profile else None,
            "pole": profile.pole.name if profile and profile.pole else None,
            "pole_id": profile.pole.id if profile and profile.pole else None,
            "client_type": profile.client_type if profile else None,
            "date_joined": user.date_joined,
        }

        # Projets où l'utilisateur est client
        projets_client = Projet.objects.filter(client=user).select_related('pole', 'chef_projet', 'created_by')
        user_data["projets_client"] = ProjetListSerializer(projets_client, many=True).data

        # Projets où l'utilisateur est chef de projet
        projets_chef = Projet.objects.filter(chef_projet=user).select_related('pole', 'client', 'created_by')
        user_data["projets_chef"] = ProjetListSerializer(projets_chef, many=True).data

        # Projets où l'utilisateur est membre
        projets_membre = Projet.objects.filter(membres=user).select_related('pole', 'client', 'chef_projet', 'created_by')
        user_data["projets_membre"] = ProjetListSerializer(projets_membre, many=True).data

        # Projets créés par l'utilisateur
        projets_crees = Projet.objects.filter(created_by=user).select_related('pole', 'client', 'chef_projet')
        user_data["projets_crees"] = ProjetListSerializer(projets_crees, many=True).data

        # Tâches assignées à l'utilisateur
        taches_assignees = Tache.objects.filter(assigne_a=user).select_related('projet', 'projet__pole')
        user_data["taches_assignees"] = TacheSerializer(taches_assignees, many=True).data

        # Statistiques
        user_data["stats"] = {
            "total_projets_client": projets_client.count(),
            "total_projets_chef": projets_chef.count(),
            "total_projets_membre": projets_membre.count(),
            "total_projets_crees": projets_crees.count(),
            "total_taches_assignees": taches_assignees.count(),
            "taches_a_faire": taches_assignees.filter(statut='a_faire').count(),
            "taches_en_cours": taches_assignees.filter(statut='en_cours').count(),
            "taches_terminees": taches_assignees.filter(statut='termine').count(),
        }

        return Response(user_data)


# ===============================
# Permissions pour les projets
# ===============================

class CanViewProjet(permissions.BasePermission):
    """
    Permission pour voir les projets selon le rôle et le statut :
    - Admin : voit tout
    - Chef de pôle : voit selon les règles de visibilité
    - Autres : voient uniquement les projets publics (en_cours, en_revision, termine, annule)
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

        # Statuts publics visibles par tous
        if obj.statut in ['en_cours', 'en_revision', 'termine', 'annule']:
            # Chef de pôle doit être du même pôle
            if profile.role == 'chef_pole' and profile.pole:
                return obj.pole == profile.pole
            # Membre/Stagiaire/Technicien voient tous les projets publics
            if profile.role in ['membre', 'stagiaire', 'technicien']:
                return True
            # Artiste/Client/Partenaire voient leurs propres projets
            if profile.role in ['artiste', 'client', 'partenaire']:
                return obj.client == user

        # Brouillon : visible uniquement par admin, créateur, chef de projet du même pôle
        if obj.statut == 'brouillon':
            if profile.role == 'chef_pole' and profile.pole:
                return (obj.pole == profile.pole and
                       (obj.created_by == user or obj.chef_projet == user))
            return False

        # En attente : visible par admin et créateur
        if obj.statut == 'en_attente':
            if profile.role == 'chef_pole':
                return obj.created_by == user
            return False

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

        queryset = Projet.objects.all().select_related('pole', 'client', 'chef_projet', 'created_by').prefetch_related('membres')

        # Admin voit tout (tous les statuts)
        if profile.role == 'admin':
            return queryset

        # Chef de pôle
        if profile.role == 'chef_pole' and profile.pole:
            # Voit les projets de son pôle selon les règles de visibilité
            return queryset.filter(
                Q(pole=profile.pole) & (
                    Q(statut__in=['en_cours', 'en_revision', 'termine', 'annule']) |  # Statuts publics
                    Q(statut='brouillon', created_by=user) |  # Brouillons créés par lui
                    Q(statut='brouillon', chef_projet=user) |  # Brouillons dont il est chef projet
                    Q(statut='en_attente', created_by=user)  # En attente créés par lui
                )
            )

        # Membre/Stagiaire/Technicien voient les projets publics uniquement
        if profile.role in ['membre', 'stagiaire', 'technicien']:
            return queryset.filter(statut__in=['en_cours', 'en_revision', 'termine', 'annule'])

        # Artiste/Client/Partenaire voient leurs propres projets publics
        if profile.role in ['artiste', 'client', 'partenaire']:
            return queryset.filter(
                Q(client=user) & Q(statut__in=['en_cours', 'en_revision', 'termine', 'annule'])
            )

        return Projet.objects.none()

    def perform_create(self, serializer):
        # Vérifier que l'utilisateur a le droit de créer
        profile = getattr(self.request.user, 'profile', None)
        if not profile or profile.role not in ['admin', 'chef_pole']:
            return Response(
                {"detail": "Vous n'avez pas la permission de créer un projet"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Logique de statut automatique
        statut = serializer.validated_data.get('statut', 'brouillon')

        # Si créé par admin et statut est brouillon ou en_attente, passer directement à en_cours
        if profile.role == 'admin' and statut in ['brouillon', 'en_attente']:
            statut = 'en_cours'

        # Sauvegarder avec created_by et statut ajusté
        serializer.save(created_by=self.request.user, statut=statut)


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

        # Admin peut tout faire
        if profile.role == 'admin':
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
        from .serializers import ProjetDetailSerializer
        serializer = ProjetDetailSerializer(projet)
        return Response(serializer.data)


# ===============================
# Permissions pour les tâches
# ===============================

class CanViewTache(permissions.BasePermission):
    """
    Permission pour voir les tâches :
    - Admin : voit tout
    - Chef de pôle : voit les tâches des projets de son pôle
    - Membres du projet : voient les tâches du projet
    - Personne assignée : voit ses tâches
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return False

        # Admin voit tout
        if profile.role == 'admin':
            return True

        # Chef de pôle voit les tâches des projets de son pôle
        if profile.role == 'chef_pole' and profile.pole:
            return obj.projet.pole == profile.pole

        # Chef de projet voit les tâches de son projet
        if obj.projet.chef_projet == user:
            return True

        # Membres du projet voient les tâches
        if obj.projet.membres.filter(id=user.id).exists():
            return True

        # Personne assignée voit la tâche
        if obj.assigne_a == user:
            return True

        return False


class CanManageTache(permissions.BasePermission):
    """
    Permission pour gérer les tâches :
    - Admin : peut tout faire
    - Chef de pôle : peut gérer les tâches des projets de son pôle
    - Chef de projet : peut gérer les tâches de son projet
    - Personne assignée : peut modifier le statut de sa tâche uniquement
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return False

        # Admin peut tout faire
        if profile.role == 'admin':
            return True

        # Chef de pôle peut gérer les tâches des projets de son pôle
        if profile.role == 'chef_pole' and profile.pole:
            return obj.projet.pole == profile.pole

        # Chef de projet peut gérer les tâches de son projet
        if obj.projet.chef_projet == user:
            return True

        # Personne assignée peut modifier le statut uniquement
        if obj.assigne_a == user:
            # Vérifier que c'est uniquement pour modifier le statut
            if request.method in ['PUT', 'PATCH']:
                return True
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
        user = self.request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return Tache.objects.none()

        queryset = Tache.objects.all().select_related('projet', 'assigne_a', 'projet__pole', 'projet__chef_projet')

        # Admin voit toutes les tâches
        if profile.role == 'admin':
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
        instance = self.get_object()
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return Response(
                {"detail": "Profil utilisateur non trouvé"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Si c'est la personne assignée (mais pas admin, chef de pôle ou chef de projet)
        # alors elle peut seulement modifier le statut
        is_assigned = instance.assigne_a == user
        is_admin = profile.role == 'admin'
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
