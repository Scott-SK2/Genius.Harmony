"""
Permissions for tache-related views
"""
from rest_framework import permissions
from ..utils.helpers import is_admin_or_super


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

        # Admin et Super Admin voient tout
        if is_admin_or_super(profile):
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
        if obj.assigne_a.filter(id=user.id).exists():
            return True

        return False


class CanCreateTache(permissions.BasePermission):
    """
    Permission pour créer des tâches :
    - Admin : peut créer
    - Chef de pôle : peut créer dans les projets de son pôle
    - Chef de projet accepté : peut créer dans son projet
    - Membres : ne peuvent PAS créer
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        profile = getattr(user, 'profile', None)
        if not profile:
            return False

        # Lecture: tous les utilisateurs authentifiés
        if request.method in permissions.SAFE_METHODS:
            return True

        # Création: admin, super_admin et chef_pole peuvent créer
        if profile.role in ['admin', 'super_admin', 'chef_pole']:
            return True

        # Chef de projet accepté peut créer (vérifié au niveau objet)
        # Pour la création, on retourne True et on vérifie dans perform_create
        return True


class CanManageTache(permissions.BasePermission):
    """
    Permission pour gérer les tâches :
    - Admin et Super Admin : peuvent tout faire
    - Créateur du projet : peut gérer les tâches de son projet
    - Chef de pôle : peut gérer les tâches des projets de son pôle
    - Chef de projet : peut gérer les tâches de son projet
    - Personne assignée : peut modifier le statut de sa tâche uniquement
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return False

        # Admin et Super Admin peuvent tout faire
        if is_admin_or_super(profile):
            return True

        # Créateur du projet peut gérer toutes les tâches de son projet
        if obj.projet.created_by == user:
            return True

        # Chef de pôle peut gérer les tâches des projets de son pôle
        if profile.role == 'chef_pole' and profile.pole:
            return obj.projet.pole == profile.pole

        # Chef de projet peut gérer les tâches de son projet
        if obj.projet.chef_projet == user:
            return True

        # Personne assignée peut modifier le statut uniquement
        if obj.assigne_a.filter(id=user.id).exists():
            # Vérifier que c'est uniquement pour modifier le statut
            if request.method in ['PUT', 'PATCH']:
                return True
            return False

        return False
