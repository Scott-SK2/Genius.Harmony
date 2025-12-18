import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export async function fetchUsers(token) {
  const res = await axios.get(`${API_URL}/users/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function updateUser(token, id, payload) {
  const res = await axios.patch(`${API_URL}/users/${id}/`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function deleteUser(token, id) {
  const res = await axios.delete(`${API_URL}/users/${id}/delete/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
