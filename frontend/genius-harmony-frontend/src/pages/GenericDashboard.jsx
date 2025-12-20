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
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          color: "#c4b5fd",
          fontSize: "1.1rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <div>Chargement...</div>
        </div>
      </div>
    );
  }

  // Router vers le bon dashboard selon le rôle
  switch (user.role) {
    case "super_admin":
    case "admin":
      return <AdminDashboard />;
    case "chef_pole":
      return <ChefPoleDashboard />;
    case "membre":
    case "stagiaire":
      return <MembreDashboard />;
    case "artiste":
    case "client":
    case "partenaire":
      return <ClientDashboard />;
    default:
      return (
        <div>
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ margin: 0, color: "#c4b5fd", fontSize: "1.05rem" }}>
              Bienvenue, <strong style={{ color: "#fff" }}>{user.username}</strong>
            </p>
          </div>
          <div
            style={{
              padding: "2rem",
              backgroundColor: "rgba(248, 113, 113, 0.1)",
              border: "1px solid #f87171",
              borderRadius: "12px",
              color: "#f87171",
            }}
          >
            <div style={{ marginBottom: "1rem", fontSize: "1.1rem", fontWeight: "600" }}>
              Rôle : <strong>{user.role}</strong>
            </div>
            <div>
              Dashboard non configuré pour ce rôle. Contactez l'administrateur.
            </div>
          </div>
        </div>
      );
  }
}
