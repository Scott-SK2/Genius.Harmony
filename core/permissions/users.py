"""
Permissions for user-related views
"""
from rest_framework import permissions
from ..utils.helpers import is_admin_or_super


class IsAdminUserProfile(permissions.BasePermission):
    """
    Autorise uniquement les users avec profile.role == 'admin' ou 'super_admin'
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        profile = getattr(user, 'profile', None)
        return is_admin_or_super(profile)


class CanEditOwnProfile(permissions.BasePermission):
    """
    Permet à un utilisateur de modifier son propre profil,
    ou aux admins de modifier n'importe quel profil
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # L'utilisateur peut modifier son propre profil
        if request.user.id == obj.id:
            return True

        # Les admins peuvent modifier n'importe quel profil
        profile = getattr(request.user, 'profile', None)
        if profile and is_admin_or_super(profile):
            return True

        return False


class CanViewUsers(permissions.BasePermission):
    """
    Permet aux membres de voir la liste des utilisateurs (lecture seule)
    Stagiaires, Collaborateurs, Partenaires et Clients ne peuvent PAS voir la liste
    Seuls les admins peuvent modifier
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        profile = getattr(user, 'profile', None)
        if not profile:
            return False

        # Lecture: tous sauf stagiaire, collaborateur, partenaire et client
        if request.method in permissions.SAFE_METHODS:
            return profile.role not in ['stagiaire', 'collaborateur', 'partenaire', 'client']

        # Modification: uniquement admin ou super_admin
        return is_admin_or_super(profile)
