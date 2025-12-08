import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
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
  const { theme } = useTheme();
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
    brouillon: theme.text.secondary,
    en_attente: theme.colors.warning,
    en_cours: theme.colors.primary,
    en_revision: theme.colors.purple,
    termine: theme.colors.success,
    annule: theme.colors.danger,
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          color: theme.text.secondary,
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
          backgroundColor: `${theme.colors.danger}10`,
          border: `1px solid ${theme.colors.danger}`,
          borderRadius: "12px",
          color: theme.colors.danger,
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
          <h1
            style={{
              margin: 0,
              marginBottom: "0.5rem",
              color: theme.text.primary,
              fontSize: "2rem",
            }}
          >
            Mes Projets
          </h1>
          <p style={{ margin: 0, color: theme.text.secondary, fontSize: "1.05rem" }}>
            Liste des projets auxquels vous avez accès
          </p>
        </div>
        {canCreateProjet && (
          <button
            onClick={() => setShowFormProjet(true)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: theme.colors.success,
              color: theme.text.inverse,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "1rem",
              transition: "all 0.2s",
              boxShadow: theme.shadow.sm,
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = theme.shadow.md;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = theme.shadow.sm;
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
            backgroundColor: theme.bg.card,
            borderRadius: "12px",
            border: `1px dashed ${theme.border.medium}`,
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📂</div>
          <p style={{ margin: 0, color: theme.text.secondary, fontSize: "1.1rem" }}>
            Aucun projet trouvé. Vous n'avez accès à aucun projet pour le moment.
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: theme.bg.card,
            borderRadius: "12px",
            border: `1px solid ${theme.border.light}`,
            overflow: "hidden",
            boxShadow: theme.shadow.md,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: theme.bg.secondary }}>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "left",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Titre
                </th>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "left",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "left",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Statut
                </th>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "left",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Pôle
                </th>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "left",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Client
                </th>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "left",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Chef de projet
                </th>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "center",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Tâches
                </th>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "center",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
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
                    borderBottom: `1px solid ${theme.border.light}`,
                    backgroundColor: index % 2 === 0 ? theme.bg.card : theme.bg.tertiary,
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bg.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? theme.bg.card : theme.bg.tertiary;
                  }}
                >
                  <td style={{ padding: "1rem" }}>
                    <Link
                      to={`/projets/${projet.id}`}
                      style={{
                        color: theme.colors.primary,
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
                    <span style={{ fontSize: "0.9rem", color: theme.text.secondary }}>
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
                        backgroundColor: `${STATUT_COLORS[projet.statut] || theme.text.secondary}20`,
                        color: STATUT_COLORS[projet.statut] || theme.text.secondary,
                        border: `1px solid ${STATUT_COLORS[projet.statut] || theme.text.secondary}40`,
                      }}
                    >
                      {STATUT_LABELS[projet.statut] || projet.statut}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem", color: theme.text.secondary }}>
                    {projet.pole_name || "—"}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem", color: theme.text.secondary }}>
                    {projet.client_username || "—"}
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.9rem", color: theme.text.secondary }}>
                    {projet.chef_projet_username || "—"}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.4rem 0.75rem",
                        backgroundColor: theme.bg.secondary,
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: theme.text.primary,
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
                        backgroundColor: theme.bg.secondary,
                        borderRadius: "6px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: theme.text.primary,
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
