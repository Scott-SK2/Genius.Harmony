import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export async function fetchPoles(token) {
  const res = await axios.get(`${API_URL}/poles/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function createPole(token, payload) {
  const res = await axios.post(`${API_URL}/poles/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function updatePole(token, id, payload) {
  const res = await axios.put(`${API_URL}/poles/${id}/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function deletePole(token, id) {
  await axios.delete(`${API_URL}/poles/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}