import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchProjets } from "../api/projets";
import { fetchTaches } from "../api/taches";

export default function ChefPoleDashboard() {
  const { user, token, logout } = useAuth();
  const [projets, setProjets] = useState([]);
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        const [projetsData, tachesData] = await Promise.all([
          fetchProjets(token),
          fetchTaches(token),
        ]);
        setProjets(projetsData);
        setTaches(tachesData);
      } catch (err) {
        console.error("Erreur fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const projetsEnCours = projets.filter((p) => p.statut === "en_cours");
  const tachesAFaire = taches.filter((t) => t.statut === "a_faire");
  const tachesEnCours = taches.filter((t) => t.statut === "en_cours");

  if (loading) {
    return <div style={{ padding: "2rem" }}>Chargement du dashboard...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px" }}>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: "0.5rem" }}>
            Dashboard Chef de Pôle
          </h1>
          <p style={{ margin: 0, color: "#666" }}>
            Bienvenue, <strong>{user?.username}</strong>
          </p>
          {user?.pole_name && (
            <p style={{ margin: 0, color: "#3498db", fontWeight: "500", marginTop: "0.25rem" }}>
              Pôle : {user.pole_name}
            </p>
          )}
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
          📁 Mes projets
        </Link>
        <Link
          to="/kanban"
          style={{
            padding: "1rem",
            backgroundColor: "#1abc9c",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          📊 Kanban des tâches
        </Link>
      </div>

      {/* Statistiques */}
      <h2>Vue d'ensemble de mon pôle</h2>
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
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{projets.length}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Projets total</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>
            {projetsEnCours.length} en cours
          </div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#1abc9c",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{taches.length}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Tâches total</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>
            {tachesAFaire.length} à faire, {tachesEnCours.length} en cours
          </div>
        </div>
      </div>

      {/* Projets en cours */}
      <h2>Projets en cours</h2>
      {projetsEnCours.length === 0 ? (
        <p style={{ color: "#666" }}>Aucun projet en cours pour le moment.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
          {projetsEnCours.slice(0, 5).map((projet) => (
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
                  {projet.titre}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#666" }}>
                  {projet.nombre_taches || 0} tâches · {projet.nombre_membres || 0} membres
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
            </Link>
          ))}
        </div>
      )}

      {/* Tâches urgentes */}
      <h2>Tâches urgentes à traiter</h2>
      {tachesAFaire.length === 0 ? (
        <p style={{ color: "#666" }}>Aucune tâche urgente.</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {tachesAFaire
            .filter((t) => t.priorite === "urgente" || t.priorite === "haute")
            .slice(0, 5)
            .map((tache) => (
              <div
                key={tache.id}
                style={{
                  padding: "1rem",
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
                    {tache.titre}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>
                    {tache.projet_details?.titre || "Projet inconnu"}
                    {tache.deadline && (
                      <span> · Deadline: {new Date(tache.deadline).toLocaleDateString("fr-FR")}</span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.4rem 0.8rem",
                    backgroundColor: tache.priorite === "urgente" ? "#e74c3c" : "#f39c12",
                    color: "#fff",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    marginLeft: "1rem",
                  }}
                >
                  {tache.priorite === "urgente" ? "Urgente" : "Haute"}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
