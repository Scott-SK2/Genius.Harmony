"""
Service layer for Projet business logic
Centralizes permissions checks and business rules
"""
from ..utils.helpers import is_admin_or_super, is_super_admin


class ProjetService:
    """Service class for Projet-related business logic"""

    @staticmethod
    def can_user_view_projet(user, projet):
        """
        Vérifie si un utilisateur peut voir un projet

        Args:
            user: L'utilisateur Django
            projet: L'instance du projet

        Returns:
            bool: True si l'utilisateur peut voir le projet
        """
        profile = getattr(user, 'profile', None)
        if not profile:
            return False

        # Admin et Super Admin voient tout
        if is_admin_or_super(profile):
            return True

        # Le créateur voit tous ses projets
        if projet.created_by == user:
            return True

        # Projets brouillon et en_attente : uniquement admin et créateur
        if projet.statut in ['brouillon', 'en_attente']:
            return False

        # Projets publics : membres, chef, client peuvent voir
        if projet.statut in ['en_cours', 'en_revision', 'termine', 'annule']:
            if (projet.membres.filter(id=user.id).exists() or
                projet.chef_projet == user or
                projet.client == user):
                return True

            # Chef de pôle peut voir les projets de son pôle
            if profile.role == 'chef_pole' and profile.pole:
                return projet.pole == profile.pole

        return False

    @staticmethod
    def can_user_manage_projet(user, projet):
        """
        Vérifie si un utilisateur peut modifier un projet

        Args:
            user: L'utilisateur Django
            projet: L'instance du projet

        Returns:
            bool: True si l'utilisateur peut modifier le projet
        """
        profile = getattr(user, 'profile', None)
        if not profile:
            return False

        # Admin et Super Admin peuvent tout modifier
        if is_admin_or_super(profile):
            return True

        # Créateur du projet peut modifier
        if projet.created_by == user:
            return True

        # Chef de pôle peut gérer les projets de son pôle
        if profile.role == 'chef_pole' and profile.pole:
            return projet.pole == profile.pole

        return False

    @staticmethod
    def can_user_delete_projet(user, projet):
        """
        Vérifie si un utilisateur peut supprimer un projet
        Seul super_admin peut supprimer

        Args:
            user: L'utilisateur Django
            projet: L'instance du projet

        Returns:
            bool: True si l'utilisateur peut supprimer le projet
        """
        profile = getattr(user, 'profile', None)
        if not profile:
            return False

        return is_super_admin(profile)

    @staticmethod
    def can_user_change_statut(user, projet, nouveau_statut=None):
        """
        Vérifie si un utilisateur peut changer le statut d'un projet

        Args:
            user: L'utilisateur Django
            projet: L'instance du projet
            nouveau_statut: Le nouveau statut souhaité (optionnel)

        Returns:
            bool: True si l'utilisateur peut changer le statut
        """
        profile = getattr(user, 'profile', None)
        if not profile:
            return False

        # Admin et Super Admin peuvent tout faire
        if is_admin_or_super(profile):
            return True

        # Créateur du projet peut changer le statut
        if projet.created_by == user:
            return True

        # Chef de pôle peut changer le statut des projets de son pôle
        if profile.role == 'chef_pole' and profile.pole and projet.pole == profile.pole:
            return True

        # Chef de projet peut mettre en_revision, termine, annule uniquement
        if projet.chef_projet == user:
            if nouveau_statut and nouveau_statut in ['en_revision', 'termine', 'annule']:
                return True
            elif not nouveau_statut:  # Si on ne spécifie pas le statut, on vérifie juste le droit général
                return True

        return False

    @staticmethod
    def get_available_statuts_for_user(user, projet):
        """
        Retourne les statuts disponibles pour un utilisateur sur un projet

        Args:
            user: L'utilisateur Django
            projet: L'instance du projet

        Returns:
            list: Liste des statuts disponibles
        """
        profile = getattr(user, 'profile', None)
        if not profile:
            return []

        all_statuts = ['brouillon', 'en_attente', 'en_cours', 'en_revision', 'termine', 'annule']

        # Admin et Super Admin peuvent tout faire
        if is_admin_or_super(profile):
            return all_statuts

        # Créateur et chef de pôle peuvent accéder à tous les statuts
        if projet.created_by == user or (profile.role == 'chef_pole' and profile.pole == projet.pole):
            return all_statuts

        # Chef de projet peut seulement mettre en_revision, termine, annule
        if projet.chef_projet == user:
            return ['en_revision', 'termine', 'annule']

        return []

    @staticmethod
    def can_user_manage_membres(user, projet):
        """
        Vérifie si un utilisateur peut gérer les membres d'un projet

        Args:
            user: L'utilisateur Django
            projet: L'instance du projet

        Returns:
            bool: True si l'utilisateur peut gérer les membres
        """
        profile = getattr(user, 'profile', None)
        if not profile:
            return False

        # Admin peut tout faire
        if is_admin_or_super(profile):
            return True

        # Chef de pôle peut gérer les projets de son pôle
        if profile.role == 'chef_pole' and profile.pole == projet.pole:
            return True

        # Chef de projet peut gérer son projet
        if projet.chef_projet == user:
            return True

        return False

    @staticmethod
    def get_next_statut(current_statut):
        """
        Retourne le statut suivant logique dans le workflow

        Args:
            current_statut: Le statut actuel

        Returns:
            str: Le statut suivant suggéré
        """
        workflow = {
            'brouillon': 'en_attente',
            'en_attente': 'en_cours',
            'en_cours': 'en_revision',
            'en_revision': 'termine',
        }
        return workflow.get(current_statut, current_statut)

    @staticmethod
    def auto_adjust_statut_for_admin(statut, is_admin):
        """
        Ajuste automatiquement le statut pour les admins
        Les admins peuvent créer directement en "en_cours"

        Args:
            statut: Le statut demandé
            is_admin: Boolean indiquant si l'utilisateur est admin

        Returns:
            str: Le statut ajusté
        """
        if is_admin and statut in ['brouillon', 'en_attente']:
            return 'en_cours'
        return statut
