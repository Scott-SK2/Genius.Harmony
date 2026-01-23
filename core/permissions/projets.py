"""
Permissions for projet-related views
"""
from rest_framework import permissions
from ..utils.helpers import is_admin_or_super, is_super_admin


class CanViewProjet(permissions.BasePermission):
    """
    Permission pour voir les projets selon le rôle et le statut :
    - Admin et Super Admin : voient tout
    - Créateur du projet : voit tous ses projets (peu importe le statut)
    - Autres utilisateurs : voient uniquement les projets publics (en_cours, en_revision, termine, annule)
      - Ne voient PAS les projets "brouillon" et "en_attente"
    """

    def has_permission(self, request, view):
        # Doit être authentifié
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return False

        # Admin et Super Admin voient tout
        if is_admin_or_super(profile):
            return True

        # Le créateur voit tous ses projets (peu importe le statut)
        if obj.created_by == user:
            return True

        # Projets "brouillon" et "en_attente" : visibles uniquement par admin et créateur
        if obj.statut in ['brouillon', 'en_attente']:
            return False

        # Projets publics : visibles par les personnes associées
        if obj.statut in ['en_cours', 'en_revision', 'termine', 'annule']:
            # Membres, chef de projet, client peuvent voir
            if (obj.membres.filter(id=user.id).exists() or
                obj.chef_projet == user or
                obj.client == user):
                return True

            # Chef de pôle peut voir les projets de son pôle
            if profile.role == 'chef_pole' and profile.pole:
                if obj.pole == profile.pole:
                    return True

        return False


class CanManageProjet(permissions.BasePermission):
    """
    Permission pour créer/modifier/supprimer les projets :
    - Super Admin : peut tout faire (y compris supprimer)
    - Admin : peut créer et modifier tous les projets
    - Chef de pôle : peut créer et modifier les projets de son pôle
    - Créateur du projet : peut modifier son propre projet (restrictions sur les statuts)
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False

        # Admin, super_admin et chef de pôle peuvent créer
        return profile.role in ['admin', 'super_admin', 'chef_pole']

    def has_object_permission(self, request, view, obj):
        user = request.user
        profile = getattr(user, 'profile', None)

        if not profile:
            return False

        # DELETE: Seul super_admin peut supprimer
        if request.method == 'DELETE':
            return is_super_admin(profile)

        # Modifier: Admin et Super Admin peuvent tout modifier
        if is_admin_or_super(profile):
            return True

        # Créateur du projet peut modifier son projet
        if obj.created_by == user:
            return True

        # Chef de pôle peut gérer les projets de son pôle
        if profile.role == 'chef_pole' and profile.pole:
            return obj.pole == profile.pole

        return False
