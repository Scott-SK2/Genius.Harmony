// Configuration de l'API
// En production, utiliser l'URL Render, en dev local utiliser localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000' : 'https://genius-harmony.onrender.com');
export const API_URL = `${API_BASE_URL}/api`;
