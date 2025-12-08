import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchProjets } from "../api/projets";

export default function ClientDashboard() {
  const { user, token, logout } = useAuth();
  const [mesProjets, setMesProjets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        const projetsData = await fetchProjets(token);
        setMesProjets(projetsData);
      } catch (err) {
        console.error("Erreur fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const projetsEnCours = mesProjets.filter((p) => p.statut === "en_cours");
  const projetsTermines = mesProjets.filter((p) => p.statut === "termine");
  const projetsEnAttente = mesProjets.filter((p) => p.statut === "en_attente" || p.statut === "brouillon");

  if (loading) {
    return <div style={{ padding: "2rem" }}>Chargement du dashboard...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px" }}>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: "0.5rem" }}>Mes Projets</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Bienvenue, <strong>{user?.username}</strong>
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Déconnexion
        </button>
      </div>

      {/* Navigation rapide */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <Link
          to="/projets"
          style={{
            padding: "1rem",
            backgroundColor: "#9b59b6",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          📁 Tous mes projets
        </Link>
      </div>

      {/* Statistiques */}
      <h2>Vue d'ensemble</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#3498db",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{mesProjets.length}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Projets total</div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#f39c12",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{projetsEnCours.length}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>En cours</div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#27ae60",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{projetsTermines.length}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Terminés</div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#95a5a6",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{projetsEnAttente.length}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>En attente</div>
        </div>
      </div>

      {/* Projets en cours */}
      <h2>Projets en cours</h2>
      {projetsEnCours.length === 0 ? (
        <p style={{ color: "#666" }}>Aucun projet en cours.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
          {projetsEnCours.map((projet) => (
            <Link
              key={projet.id}
              to={`/projets/${projet.id}`}
              style={{
                padding: "1.5rem",
                backgroundColor: "#fff",
                border: "2px solid #3498db",
                borderRadius: "8px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.75rem" }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>{projet.titre}</h3>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    {projet.type && (
                      <span style={{ marginRight: "1rem" }}>
                        Type: {projet.type}
                      </span>
                    )}
                    {projet.pole_name && (
                      <span>Pôle: {projet.pole_name}</span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.4rem 0.8rem",
                    backgroundColor: "#3498db",
                    color: "#fff",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                  }}
                >
                  En cours
                </div>
              </div>

              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.5rem" }}>
                {projet.chef_projet_username && (
                  <div>Chef de projet: <strong>{projet.chef_projet_username}</strong></div>
                )}
                <div>
                  {projet.nombre_taches || 0} tâches · {projet.nombre_membres || 0} membres
                </div>
              </div>

              {projet.date_debut && (
                <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.5rem" }}>
                  Démarré le {new Date(projet.date_debut).toLocaleDateString("fr-FR")}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Tous les projets */}
      <h2>Tous mes projets</h2>
      {mesProjets.length === 0 ? (
        <p style={{ color: "#666" }}>Vous n'avez pas encore de projets.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
          {mesProjets.map((projet) => (
            <Link
              key={projet.id}
              to={`/projets/${projet.id}`}
              style={{
                padding: "1rem",
                backgroundColor: "#f8f9fa",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ fontWeight: "500", marginBottom: "0.5rem", fontSize: "1.1rem" }}>
                {projet.titre}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.75rem" }}>
                {projet.nombre_taches || 0} tâches · {projet.nombre_membres || 0} membres
              </div>
              <div
                style={{
                  display: "inline-block",
                  padding: "0.3rem 0.6rem",
                  backgroundColor:
                    projet.statut === "en_cours"
                      ? "#3498db"
                      : projet.statut === "termine"
                      ? "#27ae60"
                      : projet.statut === "en_attente"
                      ? "#f39c12"
                      : "#95a5a6",
                  color: "#fff",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                }}
              >
                {projet.statut === "en_cours"
                  ? "En cours"
                  : projet.statut === "termine"
                  ? "Terminé"
                  : projet.statut === "en_attente"
                  ? "En attente"
                  : "Brouillon"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
