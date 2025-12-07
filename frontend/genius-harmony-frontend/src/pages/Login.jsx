import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const user = await login(username, password);

      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "chef_pole") navigate("/pole/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      console.error("Erreur login:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Identifiants incorrects");
    }
  }

  return (
    <div>
      <h1>Connexion</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}
