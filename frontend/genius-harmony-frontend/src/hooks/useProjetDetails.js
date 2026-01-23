import { useState, useEffect } from "react";
import { fetchProjetDetails } from "../api/projets";

/**
 * Custom hook for managing projet details state and loading
 * @param {string} token - Authentication token
 * @param {string|number} projetId - Project ID
 * @returns {Object} { projet, loading, error, reload }
 */
export function useProjetDetails(token, projetId) {
  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjet = async () => {
    if (!token || !projetId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchProjetDetails(token, projetId);
      setProjet(data);
    } catch (err) {
      console.error("Erreur fetch projet details:", err);

      // Déterminer le message d'erreur selon le code HTTP
      let errorMessage = "Impossible de charger les détails du projet";

      if (err.response) {
        const status = err.response.status;
        if (status === 403) {
          errorMessage = "Accès refusé : Vous n'avez pas la permission de voir ce projet";
        } else if (status === 404) {
          errorMessage = "Projet introuvable : Ce projet n'existe pas ou a été supprimé";
        } else if (status === 401) {
          errorMessage = "Non authentifié : Veuillez vous reconnecter";
        } else if (status >= 500) {
          errorMessage = "Erreur serveur : Impossible de charger le projet pour le moment";
        }
      } else if (err.message === "Network Error") {
        errorMessage = "Erreur de connexion : Vérifiez votre connexion internet";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjet();
  }, [token, projetId]);

  return {
    projet,
    setProjet,
    loading,
    error,
    reload: loadProjet,
  };
}
