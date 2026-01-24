/**
 * Instance Axios configurée pour les requêtes API
 * Gère automatiquement l'ajout du token d'authentification
 */
import axios from 'axios';
import { API_URL } from '../config';

// Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si 401 Unauthorized, le token est expiré
    if (error.response?.status === 401) {
      // Déconnecter l'utilisateur
      localStorage.removeItem('access');
      // Rediriger vers login si nécessaire
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
