import axios from "axios";
import { API_URL } from "../config";

export async function fetchProjets(token) {
  const res = await axios.get(`${API_URL}/projets/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchProjetDetails(token, id) {
  const res = await axios.get(`${API_URL}/projets/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function createProjet(token, payload) {
  const res = await axios.post(`${API_URL}/projets/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function updateProjet(token, id, payload) {
  const res = await axios.patch(`${API_URL}/projets/${id}/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function deleteProjet(token, id) {
  await axios.delete(`${API_URL}/projets/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateProjetStatut(token, id, statut) {
  const res = await axios.patch(`${API_URL}/projets/${id}/update-statut/`, { statut }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
