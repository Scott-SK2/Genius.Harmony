import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { fetchProjetDetails } from "../api/projets";
import FormTache from "../components/FormTache";
import UploadDocument from "../components/UploadDocument";

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

const TACHE_STATUT_LABELS = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
};

const TACHE_PRIORITE_LABELS = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

export default function ProjetDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const { theme } = useTheme();
  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormTache, setShowFormTache] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);

  const loadProjet = async () => {
    if (!token || !id) return;
    try {
      setLoading(true);
      const data = await fetchProjetDetails(token, id);
      setProjet(data);
    } catch (err) {
      console.error("Erreur fetch projet details:", err);
      setError("Impossible de charger les détails du projet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjet();
  }, [token, id]);

  const STATUT_COLORS = {
    brouillon: theme.text.secondary,
    en_attente: theme.colors.warning,
    en_cours: theme.colors.primary,
    en_revision: theme.colors.purple,
    termine: theme.colors.success,
    annule: theme.colors.danger,
  };

  const PRIORITE_COLORS = {
    basse: theme.text.secondary,
    normale: theme.colors.primary,
    haute: theme.colors.warning,
    urgente: theme.colors.danger,
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
          <div>Chargement du projet...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div
          style={{
            padding: "2rem",
            backgroundColor: `${theme.colors.danger}10`,
            border: `1px solid ${theme.colors.danger}`,
            borderRadius: "12px",
            color: theme.colors.danger,
            marginBottom: "1.5rem",
          }}
        >
          <strong>Erreur :</strong> {error}
        </div>
        <Link
          to="/projets"
          style={{
            color: theme.colors.primary,
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = "none";
          }}
        >
          ← Retour à la liste des projets
        </Link>
      </div>
    );
  }

  if (!projet) {
    return (
      <div>
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: theme.bg.card,
            borderRadius: "12px",
            border: `1px dashed ${theme.border.medium}`,
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❓</div>
          <p style={{ color: theme.text.secondary, fontSize: "1.1rem" }}>
            Projet introuvable
          </p>
        </div>
        <Link
          to="/projets"
          style={{
            color: theme.colors.primary,
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = "none";
          }}
        >
          ← Retour à la liste des projets
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Navigation */}
      <div style={{ marginBottom: "2rem" }}>
        <Link
          to="/projets"
          style={{
            color: theme.colors.primary,
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "600",
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = "none";
          }}
        >
          ← Retour à la liste
        </Link>
      </div>

      {/* En-tête du projet */}
      <div
        style={{
          marginBottom: "2.5rem",
          backgroundColor: theme.bg.card,
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: theme.shadow.md,
          border: `1px solid ${theme.border.light}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, color: theme.text.primary, fontSize: "2rem" }}>
            {projet.titre}
          </h1>
          <span
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "600",
              backgroundColor: `${STATUT_COLORS[projet.statut] || theme.text.secondary}20`,
              color: STATUT_COLORS[projet.statut] || theme.text.secondary,
              border: `1px solid ${STATUT_COLORS[projet.statut] || theme.text.secondary}40`,
            }}
          >
            {STATUT_LABELS[projet.statut] || projet.statut}
          </span>
        </div>

        <div style={{ color: theme.text.secondary, fontSize: "0.95rem", lineHeight: "1.8" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <span style={{ marginRight: "2rem" }}>
              <strong style={{ color: theme.text.primary }}>📋 Type:</strong> {TYPE_LABELS[projet.type] || projet.type}
            </span>
            {projet.pole_details && (
              <span>
                <strong style={{ color: theme.text.primary }}>🎯 Pôle:</strong> {projet.pole_details.name}
              </span>
            )}
          </div>
          {(projet.date_debut || projet.date_fin_prevue) && (
            <div>
              {projet.date_debut && (
                <span style={{ marginRight: "2rem" }}>
                  <strong style={{ color: theme.text.primary }}>📅 Début:</strong> {new Date(projet.date_debut).toLocaleDateString("fr-FR")}
                </span>
              )}
              {projet.date_fin_prevue && (
                <span>
                  <strong style={{ color: theme.text.primary }}>🏁 Fin prévue:</strong> {new Date(projet.date_fin_prevue).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {projet.description && (
        <div
          style={{
            padding: "2rem",
            backgroundColor: theme.bg.card,
            borderRadius: "16px",
            marginBottom: "2.5rem",
            border: `1px solid ${theme.border.light}`,
            boxShadow: theme.shadow.sm,
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "1rem",
              color: theme.text.primary,
              fontSize: "1.3rem",
            }}
          >
            📝 Description
          </h3>
          <p
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              color: theme.text.secondary,
              lineHeight: "1.6",
            }}
          >
            {projet.description}
          </p>
        </div>
      )}

      {/* Équipe */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h2
          style={{
            color: theme.text.primary,
            marginBottom: "1.5rem",
            fontSize: "1.5rem",
          }}
        >
          👥 Équipe du projet
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {projet.client_details && (
            <div
              style={{
                padding: "1.5rem",
                backgroundColor: theme.bg.card,
                borderRadius: "12px",
                border: `1px solid ${theme.border.light}`,
                boxShadow: theme.shadow.sm,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme.shadow.md;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = theme.shadow.sm;
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: theme.text.tertiary,
                  marginBottom: "0.75rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                👤 Client
              </div>
              <div style={{ fontWeight: "600", color: theme.text.primary, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
                {projet.client_details.username}
              </div>
              <div style={{ fontSize: "0.9rem", color: theme.text.secondary }}>{projet.client_details.email}</div>
            </div>
          )}

          {projet.chef_projet_details && (
            <div
              style={{
                padding: "1.5rem",
                backgroundColor: theme.bg.card,
                borderRadius: "12px",
                border: `1px solid ${theme.border.light}`,
                boxShadow: theme.shadow.sm,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme.shadow.md;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = theme.shadow.sm;
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: theme.text.tertiary,
                  marginBottom: "0.75rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                🎯 Chef de projet
              </div>
              <div style={{ fontWeight: "600", color: theme.text.primary, marginBottom: "0.5rem", fontSize: "1.1rem" }}>
                {projet.chef_projet_details.username}
              </div>
              <div style={{ fontSize: "0.9rem", color: theme.text.secondary }}>{projet.chef_projet_details.email}</div>
            </div>
          )}
        </div>

        {projet.membres_details && projet.membres_details.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h3
              style={{
                color: theme.text.primary,
                marginBottom: "1rem",
                fontSize: "1.2rem",
              }}
            >
              Membres de l'équipe ({projet.membres_details.length})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {projet.membres_details.map((membre) => (
                <div
                  key={membre.id}
                  style={{
                    padding: "1rem",
                    backgroundColor: theme.bg.tertiary,
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    border: `1px solid ${theme.border.light}`,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bg.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                  }}
                >
                  <div style={{ fontWeight: "600", color: theme.text.primary, marginBottom: "0.25rem" }}>
                    {membre.username}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: theme.text.secondary }}>{membre.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tâches */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: theme.text.primary, fontSize: "1.5rem" }}>
            ✓ Tâches ({projet.taches?.length || 0})
          </h2>
          <button
            onClick={() => setShowFormTache(true)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: theme.colors.info,
              color: theme.text.inverse,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
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
            + Nouvelle tâche
          </button>
        </div>
        {!projet.taches || projet.taches.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: theme.bg.card,
              borderRadius: "12px",
              border: `1px dashed ${theme.border.medium}`,
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <p style={{ color: theme.text.secondary, margin: 0 }}>
              Aucune tâche pour ce projet.
            </p>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: theme.bg.card,
              borderRadius: "12px",
              border: `1px solid ${theme.border.light}`,
              overflow: "hidden",
              boxShadow: theme.shadow.sm,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                    Priorité
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
                    Assigné à
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
                    Deadline
                  </th>
                </tr>
              </thead>
              <tbody>
                {projet.taches.map((tache, index) => (
                  <tr
                    key={tache.id}
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
                    <td style={{ padding: "1rem", fontWeight: "500", color: theme.text.primary }}>{tache.titre}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.9rem", color: theme.text.secondary }}>
                        {TACHE_STATUT_LABELS[tache.statut] || tache.statut}
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
                          backgroundColor: `${PRIORITE_COLORS[tache.priorite] || theme.text.secondary}20`,
                          color: PRIORITE_COLORS[tache.priorite] || theme.text.secondary,
                          border: `1px solid ${PRIORITE_COLORS[tache.priorite] || theme.text.secondary}40`,
                        }}
                      >
                        {TACHE_PRIORITE_LABELS[tache.priorite] || tache.priorite}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: theme.text.secondary }}>
                      {tache.assigne_a_details?.username || "—"}
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.9rem", color: theme.text.secondary }}>
                      {tache.deadline ? new Date(tache.deadline).toLocaleDateString("fr-FR") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documents */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: theme.text.primary, fontSize: "1.5rem" }}>
            📄 Documents ({projet.documents?.length || 0})
          </h2>
          <button
            onClick={() => setShowUploadDoc(true)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: theme.colors.primary,
              color: theme.text.inverse,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
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
            + Uploader un document
          </button>
        </div>
        {!projet.documents || projet.documents.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: theme.bg.card,
              borderRadius: "12px",
              border: `1px dashed ${theme.border.medium}`,
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
            <p style={{ color: theme.text.secondary, margin: 0 }}>
              Aucun document pour ce projet.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {projet.documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: "1.5rem",
                  backgroundColor: theme.bg.card,
                  borderRadius: "12px",
                  border: `1px solid ${theme.border.light}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: theme.shadow.sm,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadow.md;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadow.sm;
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.75rem",
                      color: theme.text.primary,
                      fontSize: "1.05rem",
                    }}
                  >
                    📎 {doc.titre}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: theme.text.secondary, marginBottom: "0.5rem" }}>
                    Type: <strong>{doc.type}</strong> · Uploadé par{" "}
                    <strong>{doc.uploade_par_details?.username || "—"}</strong> le{" "}
                    {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </div>
                  {doc.description && (
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: theme.text.tertiary,
                        marginTop: "0.5rem",
                        paddingTop: "0.5rem",
                        borderTop: `1px solid ${theme.border.light}`,
                      }}
                    >
                      {doc.description}
                    </div>
                  )}
                </div>
                {doc.fichier_url && (
                  <a
                    href={doc.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: theme.colors.primary,
                      color: theme.text.inverse,
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      marginLeft: "1.5rem",
                      transition: "all 0.2s",
                      boxShadow: theme.shadow.sm,
                      whiteSpace: "nowrap",
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
                    ⬇ Télécharger
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informations Odoo (si disponibles) */}
      {(projet.odoo_project_id || projet.odoo_invoice_id) && (
        <div
          style={{
            padding: "2rem",
            backgroundColor: `${theme.colors.info}10`,
            borderRadius: "12px",
            borderLeft: `4px solid ${theme.colors.info}`,
            border: `1px solid ${theme.colors.info}40`,
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "1rem",
              color: theme.text.primary,
              fontSize: "1.3rem",
            }}
          >
            🔗 Informations Odoo
          </h3>
          {projet.odoo_project_id && (
            <div style={{ marginBottom: "0.75rem", color: theme.text.secondary }}>
              <strong style={{ color: theme.text.primary }}>ID Projet Odoo:</strong> {projet.odoo_project_id}
            </div>
          )}
          {projet.odoo_invoice_id && (
            <div style={{ color: theme.text.secondary }}>
              <strong style={{ color: theme.text.primary }}>ID Facture Odoo:</strong> {projet.odoo_invoice_id}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <FormTache
        isOpen={showFormTache}
        onClose={() => setShowFormTache(false)}
        projetId={parseInt(id)}
        onSuccess={loadProjet}
      />

      <UploadDocument
        isOpen={showUploadDoc}
        onClose={() => setShowUploadDoc(false)}
        projetId={parseInt(id)}
        onSuccess={loadProjet}
      />
    </div>
  );
}
