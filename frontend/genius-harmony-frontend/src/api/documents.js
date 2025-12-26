import axios from "axios";
import { API_URL } from "../config";

/**
 * Récupère la liste des documents avec filtres optionnels
 * @param {string} token - Token JWT
 * @param {object} filters - Filtres optionnels { projet }
 */
export async function fetchDocuments(token, filters = {}) {
  const params = new URLSearchParams();

  if (filters.projet) params.append("projet", filters.projet);

  const url = `${API_URL}/documents/${params.toString() ? `?${params.toString()}` : ""}`;

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

/**
 * Upload un nouveau document
 * @param {string} token - Token JWT
 * @param {FormData} formData - FormData contenant le fichier et les métadonnées
 */
export async function uploadDocument(token, formData) {
  const res = await axios.post(`${API_URL}/documents/`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

/**
 * Supprime un document
 * @param {string} token - Token JWT
 * @param {number} id - ID du document
 */
export async function deleteDocument(token, id) {
  await axios.delete(`${API_URL}/documents/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
