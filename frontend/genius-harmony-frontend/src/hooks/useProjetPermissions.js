import { useMemo } from "react";

/**
 * Custom hook for checking projet-related permissions
 * @param {Object} user - Current user object
 * @param {Object} projet - Project object
 * @returns {Object} Permission flags
 */
export function useProjetPermissions(user, projet) {
  const permissions = useMemo(() => {
    if (!user || !projet) {
      return {
        canChangeStatut: false,
        canManageMembres: false,
        canEditProjet: false,
        canDeleteProjet: false,
        availableStatuts: [],
      };
    }

    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const isSuperAdmin = user.role === 'super_admin';
    const isCreator = projet.created_by === user.id;
    const isChefPole = user.role === 'chef_pole' && projet.pole === user.pole;
    const isChefProjet = projet.chef_projet === user.id;

    // Peut changer le statut
    const canChangeStatut = isAdmin || isCreator || isChefPole || isChefProjet;

    // Peut gérer les membres
    const canManageMembres = isAdmin || isChefPole || isChefProjet;

    // Peut éditer le projet
    const canEditProjet = isAdmin || isCreator || isChefPole;

    // Peut supprimer le projet (uniquement super admin)
    const canDeleteProjet = isSuperAdmin;

    // Statuts disponibles
    let availableStatuts = [];
    if (isAdmin || isCreator || isChefPole) {
      availableStatuts = ['brouillon', 'en_attente', 'en_cours', 'en_revision', 'termine', 'annule'];
    } else if (isChefProjet) {
      availableStatuts = ['en_revision', 'termine', 'annule'];
    }

    return {
      canChangeStatut,
      canManageMembres,
      canEditProjet,
      canDeleteProjet,
      availableStatuts,
      isAdmin,
      isSuperAdmin,
      isCreator,
      isChefPole,
      isChefProjet,
    };
  }, [user, projet]);

  return permissions;
}
