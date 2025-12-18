import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchProjets } from "../api/projets";
import FormProjet from "../components/FormProjet";

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

export default function ProjetsList() {
  const { token, user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormProjet, setShowFormProjet] = useState(false);

  const loadProjets = async () => {
    if (!token) return;
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
  };

  useEffect(() => {
    loadProjets();
  }, [token]);

  const STATUT_COLORS = {
    brouillon: "#a78bfa",
    en_attente: "#f59e0b",
    en_cours: "#7c3aed",
    en_revision: "#a78bfa",
    termine: "#10b981",
    annule: "#f87171",
  };

  if (loading) {
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
          <div>Chargement des projets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "2rem",
          backgroundColor: "rgba(248, 113, 113, 0.1)",
          border: "1px solid #f87171",
          borderRadius: "12px",
          color: "#f87171",
        }}
      >
        <strong>Erreur :</strong> {error}
      </div>
    );
  }

  const canCreateProjet = user?.role === "admin" || user?.role === "chef_pole";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <p style={{ margin: 0, color: "#c4b5fd", fontSize: "1.05rem" }}>
            Liste des projets auxquels vous avez accès
          </p>
        </div>
        {canCreateProjet && (
          <button
            onClick={() => setShowFormProjet(true)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "1rem",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.3)";
            }}
          >
            + Nouveau projet
          </button>
        )}
      </div>

      {projets.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            backgroundColor: "#2d1b69",
            borderRadius: "12px",
            border: "1px dashed #4c1d95",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📂</div>
          <p style={{ margin: 0, color: "#c4b5fd", fontSize: "1.1rem" }}>
            Aucun projet trouvé. Vous n'avez accès à aucun projet pour le moment.
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#2d1b69",
            borderRadius: "12px",
            border: "1px solid #4c1d95",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #4c1d95" }}>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Titre
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Statut
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Pôle
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Client
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Chef de projet
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "center",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Tâches
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "center",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Membres
                </th>
              </tr>
            </thead>
            <tbody>
              {projets.map((projet, index) => (
                <tr
                  key={projet.id}
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#4c1d95";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <td style={{ padding: "1rem" }}>
                    <Link
                      to={`/projets/${projet.id}`}
                      style={{
                        color: "#7c3aed",
                        textDecoration: "none",
                        fontWeight: "600",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.textDecoration = "underline";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.textDecoration = "none";
                      }}
                    >
                      {projet.titre}
                    </Link>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ fontSize: "0.9rem", color: "#c4b5fd" }}>
                      {TYPE_LABELS[projet.type] || projet.type}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.4rem 0.75rem",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        backgroundColor: `${STATUT_COLORS[projet.statut] || "#a78bfa"}20`,
                        color: STATUT_COLORS[projet.statut] || "#a78bfa",
                        border: `1px solid ${STATUT_COLORS[projet.statut] || "#a78bfa"}40`,
                      }}
                    >
                      {STATUT_LABELS[projet.statut] || projet.statut}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#c4b5fd" }}>
                    {projet.pole_name || "—"}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#c4b5fd" }}>
                    {projet.client_username || "—"}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem", color: "#c4b5fd" }}>
                    {projet.chef_projet_username || "—"}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.4rem 0.75rem",
                        backgroundColor: "#4c1d95",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "#fff",
                      }}
                    >
                      {projet.nombre_taches || 0}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.4rem 0.75rem",
                        backgroundColor: "#4c1d95",
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "#fff",
                      }}
                    >
                      {projet.nombre_membres || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de création de projet */}
      <FormProjet
        isOpen={showFormProjet}
        onClose={() => setShowFormProjet(false)}
        onSuccess={loadProjets}
      />
    </div>
  );
}
