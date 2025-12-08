import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

/**
 * Récupère la liste des tâches avec filtres optionnels
 * @param {string} token - Token JWT
 * @param {object} filters - Filtres optionnels { projet, assigne_a, statut, priorite }
 */
export async function fetchTaches(token, filters = {}) {
  const params = new URLSearchParams();

  if (filters.projet) params.append("projet", filters.projet);
  if (filters.assigne_a) params.append("assigne_a", filters.assigne_a);
  if (filters.statut) params.append("statut", filters.statut);
  if (filters.priorite) params.append("priorite", filters.priorite);

  const url = `${API_URL}/taches/${params.toString() ? `?${params.toString()}` : ""}`;

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Récupère les détails d'une tâche
 * @param {string} token - Token JWT
 * @param {number} id - ID de la tâche
 */
export async function fetchTacheDetails(token, id) {
  const res = await axios.get(`${API_URL}/taches/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Crée une nouvelle tâche
 * @param {string} token - Token JWT
 * @param {object} payload - Données de la tâche
 */
export async function createTache(token, payload) {
  const res = await axios.post(`${API_URL}/taches/`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Met à jour une tâche existante
 * @param {string} token - Token JWT
 * @param {number} id - ID de la tâche
 * @param {object} payload - Données à mettre à jour
 */
export async function updateTache(token, id, payload) {
  const res = await axios.patch(`${API_URL}/taches/${id}/`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Supprime une tâche
 * @param {string} token - Token JWT
 * @param {number} id - ID de la tâche
 */
export async function deleteTache(token, id) {
  await axios.delete(`${API_URL}/taches/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
