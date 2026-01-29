/**
 * Configuration React Query pour optimiser les performances et réduire les appels Redis
 *
 * Optimisations :
 * - Cache de 5 minutes par défaut
 * - Refetch uniquement quand l'onglet redevient actif
 * - Pas de refetch au window focus (trop agressif)
 * - Retry limité à 1 tentative
 * - Déduplication automatique des requêtes
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pendant 5 minutes avant de considérer les données comme "stale"
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Garde les données en cache pendant 10 minutes même si inutilisées
      cacheTime: 10 * 60 * 1000, // 10 minutes (deprecated, use gcTime in future)

      // Refetch quand l'onglet redevient visible
      refetchOnWindowFocus: false, // Désactivé pour éviter trop de requêtes

      // Refetch quand la connexion internet revient
      refetchOnReconnect: true,

      // Refetch quand le composant remonte
      refetchOnMount: false, // Utilise le cache si disponible

      // Retry une seule fois en cas d'erreur
      retry: 1,

      // Délai avant retry : 1 seconde
      retryDelay: 1000,
    },
    mutations: {
      // Retry une fois pour les mutations
      retry: 1,
    },
  },
});
