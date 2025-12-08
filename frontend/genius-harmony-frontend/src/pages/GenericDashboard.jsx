// src/pages/GenericDashboard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import ChefPoleDashboard from "./ChefPoleDashboard";
import MembreDashboard from "./MembreDashboard";
import ClientDashboard from "./ClientDashboard";

export default function GenericDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si pas d'utilisateur et pas en cours de chargement, rediriger vers le login
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Afficher un loader pendant le chargement
  if (loading || !user) {
    return <div style={{ padding: "2rem" }}>Chargement...</div>;
  }

  // Router vers le bon dashboard selon le rôle
  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "chef_pole":
      return <ChefPoleDashboard />;
    case "membre":
    case "stagiaire":
      return <MembreDashboard />;
    case "client":
    case "partenaire":
      return <ClientDashboard />;
    default:
      return (
        <div style={{ padding: "2rem" }}>
          <h1>Mon espace – Genius.Harmony</h1>
          <p>
            Bienvenue, <strong>{user.username}</strong>
          </p>
          <p>
            Rôle : <strong>{user.role}</strong>
          </p>
          <p style={{ color: "#e74c3c" }}>
            Dashboard non configuré pour ce rôle. Contactez l'administrateur.
          </p>
        </div>
      );
  }
}
