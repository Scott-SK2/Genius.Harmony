import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchProjets } from "../api/projets";

const TYPE_LABELS = {
  film: "Film",
  court_metrage: "Court métrage",
  web_serie: "Web série",
  event: "Event",
  atelier_animation: "Atelier/Animation",
  musique: "Musique",
  autre: "Autre",
};

const STATUT_LABELS = {
  brouillon: "Brouillon",
  en_attente: "En attente",
  en_cours: "En cours",
  en_revision: "En révision",
  termine: "Terminé",
  annule: "Annulé",
};

const STATUT_COLORS = {
  brouillon: "#999",
  en_attente: "#f39c12",
  en_cours: "#3498db",
  en_revision: "#9b59b6",
  termine: "#27ae60",
  annule: "#e74c3c",
};

export default function ProjetsList() {
  const { token } = useAuth();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchProjets(token);
        setProjets(data);
      } catch (err) {
        console.error("Erreur fetch projets:", err);
        setError("Impossible de charger les projets");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Chargement des projets...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "#e74c3c" }}>
        <strong>Erreur :</strong> {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Mes Projets</h1>
      <p>Liste des projets auxquels vous avez accès</p>

      {projets.length === 0 ? (
        <p style={{ marginTop: "2rem", color: "#666" }}>
          Aucun projet trouvé. Vous n'avez accès à aucun projet pour le moment.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1.5rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.75rem" }}>
                Titre
              </th>
              <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.75rem" }}>
                Type
              </th>
              <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.75rem" }}>
                Statut
              </th>
              <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.75rem" }}>
                Pôle
              </th>
              <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.75rem" }}>
                Client
              </th>
              <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.75rem" }}>
                Chef de projet
              </th>
              <th style={{ borderBottom: "2px solid #ccc", textAlign: "center", padding: "0.75rem" }}>
                Tâches
              </th>
              <th style={{ borderBottom: "2px solid #ccc", textAlign: "center", padding: "0.75rem" }}>
                Membres
              </th>
            </tr>
          </thead>
          <tbody>
            {projets.map((projet) => (
              <tr key={projet.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.75rem" }}>
                  <Link
                    to={`/projets/${projet.id}`}
                    style={{
                      color: "#3498db",
                      textDecoration: "none",
                      fontWeight: "500",
                    }}
                  >
                    {projet.titre}
                  </Link>
                </td>
                <td style={{ padding: "0.75rem" }}>
                  <span style={{ fontSize: "0.9rem", color: "#666" }}>
                    {TYPE_LABELS[projet.type] || projet.type}
                  </span>
                </td>
                <td style={{ padding: "0.75rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      backgroundColor: STATUT_COLORS[projet.statut] || "#999",
                      color: "#fff",
                    }}
                  >
                    {STATUT_LABELS[projet.statut] || projet.statut}
                  </span>
                </td>
                <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                  {projet.pole_name || "—"}
                </td>
                <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                  {projet.client_username || "—"}
                </td>
                <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                  {projet.chef_projet_username || "—"}
                </td>
                <td style={{ padding: "0.75rem", textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#ecf0f1",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    {projet.nombre_taches || 0}
                  </span>
                </td>
                <td style={{ padding: "0.75rem", textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#ecf0f1",
                      borderRadius: "4px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    {projet.nombre_membres || 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
