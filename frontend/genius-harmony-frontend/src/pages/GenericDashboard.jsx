// src/pages/GenericDashboard.jsx
import { useAuth } from "../context/AuthContext";

export default function GenericDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Mon espace – Genius.Harmony</h1>
      <p>Bienvenue, <strong>{user?.username}</strong></p>
      <p>Rôle : <strong>{user?.role}</strong></p>

      <p>
        Cette page sera adaptée plus tard en fonction du rôle :
        membre, stagiaire, client, chef de pôle…
      </p>
    </div>
  );
}
