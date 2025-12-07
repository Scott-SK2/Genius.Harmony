import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export async function login(username, password) {
  const response = await axios.post(`${API_URL}/auth/login/`, {
    username,
    password,
  });
  return response.data; // { access, refresh }
}

export async function getMe(token) {
  const response = await axios.get(`${API_URL}/auth/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
