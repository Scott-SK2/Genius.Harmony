"""
User-related views
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model

from ..serializers import UserProfileSerializer, TacheSerializer, ProjetListSerializer
from ..permissions import IsAdminUserProfile, CanEditOwnProfile, CanViewUsers
from ..models import Projet, Tache

User = get_user_model()


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().select_related('profile', 'profile__pole')
    serializer_class = UserProfileSerializer
    permission_classes = [CanViewUsers]


class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all().select_related('profile', 'profile__pole')
    serializer_class = UserProfileSerializer
    permission_classes = [CanEditOwnProfile]


class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdminUserProfile]


class UserUploadPhotoView(APIView):
    """
    Vue pour uploader une photo de profil
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            user = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        # Vérifier que l'utilisateur peut modifier cette photo
        # Soit c'est son propre profil, soit c'est un admin ou super_admin
        profile = getattr(request.user, 'profile', None)
        if request.user.id != pk and (not profile or profile.role not in ['admin', 'super_admin']):
            return Response(
                {"detail": "Vous n'avez pas la permission de modifier cette photo"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Récupérer le fichier
        photo = request.FILES.get('photo')
        if not photo:
            return Response(
                {"detail": "Aucune photo fournie"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Enregistrer la photo
        user.profile.photo = photo
        user.profile.save()

        # Retourner les données mises à jour
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response(serializer.data)


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

        photo_url = None
        if profile and profile.photo:
            photo_url = profile.photo.url
            # Si l'URL n'est pas déjà absolue (S3), construire l'URL complète
            if not photo_url.startswith(('http://', 'https://')):
                photo_url = request.build_absolute_uri(photo_url)

        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": profile.role if profile else None,
            "pole": profile.pole.name if profile and profile.pole else None,
            "pole_id": profile.pole.id if profile and profile.pole else None,
            "membre_specialite": profile.membre_specialite if profile else None,
            "description": profile.description if profile else None,
            "client_type": profile.client_type if profile else None,
            "photo_url": photo_url,
            "date_joined": user.date_joined,
            # Champs de contact
            "phone": profile.phone if profile else None,
            "website": profile.website if profile else None,
            "instagram": profile.instagram if profile else None,
            "twitter": profile.twitter if profile else None,
            "tiktok": profile.tiktok if profile else None,
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
