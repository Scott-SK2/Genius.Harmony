"""
Permissions for document-related views
"""
from rest_framework import permissions


class CanDeleteDocument(permissions.BasePermission):
    """
    Permission pour supprimer un document :
    - Super Admin : peut tout supprimer
    - Admin : peut tout supprimer
    - Propriétaire du document (uploade_par) : peut supprimer son propre document
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        profile = getattr(user, 'profile', None)
        if not profile:
            return False

        # Admin et Super Admin peuvent tout supprimer
        if profile.role in ['admin', 'super_admin']:
            return True

        # Le propriétaire du document peut le supprimer
        if obj.uploade_par == user:
            return True

        return False
