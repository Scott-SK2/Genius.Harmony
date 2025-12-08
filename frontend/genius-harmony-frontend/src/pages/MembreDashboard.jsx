import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchProjets } from "../api/projets";
import { fetchTaches } from "../api/taches";

export default function MembreDashboard() {
  const { user, token, logout } = useAuth();
  const [projets, setProjets] = useState([]);
  const [mesTaches, setMesTaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;

    (async () => {
      try {
        setLoading(true);
        const [projetsData, tachesData] = await Promise.all([
          fetchProjets(token),
          fetchTaches(token, { assigne_a: user.id }),
        ]);
        setProjets(projetsData);
        setMesTaches(tachesData);
      } catch (err) {
        console.error("Erreur fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user]);

  const mesTachesAFaire = mesTaches.filter((t) => t.statut === "a_faire");
  const mesTachesEnCours = mesTaches.filter((t) => t.statut === "en_cours");
  const mesTachesTerminees = mesTaches.filter((t) => t.statut === "termine");

  if (loading) {
    return <div style={{ padding: "2rem" }}>Chargement du dashboard...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px" }}>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: "0.5rem" }}>Mon Espace</h1>
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
      <h2>Mes tâches</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#95a5a6",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{mesTachesAFaire.length}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>À faire</div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#3498db",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{mesTachesEnCours.length}</div>
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
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{mesTachesTerminees.length}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Terminées</div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#9b59b6",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{projets.length}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Projets</div>
        </div>
      </div>

      {/* Mes tâches à faire */}
      <h2>Mes tâches à faire</h2>
      {mesTachesAFaire.length === 0 ? (
        <p style={{ color: "#666" }}>Vous n'avez aucune tâche à faire pour le moment. Excellent travail !</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "2rem" }}>
          {mesTachesAFaire.map((tache) => (
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
                  backgroundColor:
                    tache.priorite === "urgente"
                      ? "#e74c3c"
                      : tache.priorite === "haute"
                      ? "#f39c12"
                      : tache.priorite === "normale"
                      ? "#3498db"
                      : "#95a5a6",
                  color: "#fff",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  marginLeft: "1rem",
                }}
              >
                {tache.priorite === "urgente"
                  ? "Urgente"
                  : tache.priorite === "haute"
                  ? "Haute"
                  : tache.priorite === "normale"
                  ? "Normale"
                  : "Basse"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mes tâches en cours */}
      <h2>Mes tâches en cours</h2>
      {mesTachesEnCours.length === 0 ? (
        <p style={{ color: "#666" }}>Aucune tâche en cours.</p>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "2rem" }}>
          {mesTachesEnCours.map((tache) => (
            <div
              key={tache.id}
              style={{
                padding: "1rem",
                backgroundColor: "#e8f4f8",
                border: "1px solid #3498db",
                borderRadius: "8px",
              }}
            >
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
          ))}
        </div>
      )}

      {/* Mes projets */}
      <h2>Mes projets</h2>
      {projets.length === 0 ? (
        <p style={{ color: "#666" }}>Vous n'êtes assigné à aucun projet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
          {projets.map((projet) => (
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
              <div style={{ fontWeight: "500", marginBottom: "0.5rem" }}>
                {projet.titre}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.5rem" }}>
                {projet.nombre_taches || 0} tâches · {projet.nombre_membres || 0} membres
              </div>
              <div
                style={{
                  display: "inline-block",
                  padding: "0.25rem 0.5rem",
                  backgroundColor:
                    projet.statut === "en_cours"
                      ? "#3498db"
                      : projet.statut === "termine"
                      ? "#27ae60"
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
                  : "Brouillon"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
