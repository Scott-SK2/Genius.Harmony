import { createContext, useState, useEffect, useContext } from "react";
import { login as apiLogin, getMe } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access") || null);
  const [loading, setLoading] = useState(true);

  // Chargement initial : si on a un token, on va chercher /me
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const userData = await getMe(token);
        setUser(userData);
      } catch (err) {
        console.error("Erreur getMe:", err);
        setUser(null);
        setToken(null);
        localStorage.removeItem("access");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function login(username, password) {
    setLoading(true);
    try {
      const data = await apiLogin(username, password);
      setToken(data.access);
      localStorage.setItem("access", data.access);

      const userData = await getMe(data.access);
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access");
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
