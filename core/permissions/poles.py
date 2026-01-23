"""
Permissions for pole-related views
"""
from rest_framework import permissions
from ..utils.helpers import is_admin_or_super


class CanViewPoles(permissions.BasePermission):
    """
    - Admins et Super Admins : peuvent voir et gérer les pôles
    - Chefs de pôle et Membres : peuvent voir les pôles (lecture seule)
    - Autres : pas d'accès
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        profile = getattr(user, 'profile', None)
        if not profile:
            return False

        # Lecture: admins, super admins, chefs de pôle et membres
        if request.method in permissions.SAFE_METHODS:
            return is_admin_or_super(profile) or profile.role in ['chef_pole', 'membre']

        # Modification/Création/Suppression: uniquement admins et super admins
        return is_admin_or_super(profile)
