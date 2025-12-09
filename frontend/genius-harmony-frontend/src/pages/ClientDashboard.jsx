import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { fetchProjets } from "../api/projets";

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
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
          <div>Chargement de vos projets...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            marginBottom: "0.75rem",
            color: theme.text.primary,
            fontSize: "2.2rem",
          }}
        >
          Mes Projets
        </h1>
        <p style={{ margin: 0, color: theme.text.secondary, fontSize: "1.1rem" }}>
          Bienvenue, <strong style={{ color: theme.text.primary }}>{user?.username}</strong>
        </p>
      </div>

      {/* Statistiques */}
      <h2
        style={{
          color: theme.text.primary,
          marginBottom: "1.5rem",
          fontSize: "1.5rem",
        }}
      >
        Vue d'ensemble
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        {[
          { icon: "📁", label: "Total", value: mesProjets.length, color: theme.colors.primary },
          { icon: "⚡", label: "En cours", value: projetsEnCours.length, color: theme.colors.warning },
          { icon: "✓", label: "Terminés", value: projetsTermines.length, color: theme.colors.success },
          { icon: "⏳", label: "En attente", value: projetsEnAttente.length, color: theme.text.secondary },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: theme.bg.card,
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: theme.shadow.md,
              border: `1px solid ${theme.border.light}`,
              transition: "all 0.3s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = theme.shadow.xl;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = theme.shadow.md;
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "12px",
                  backgroundColor: `${stat.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: theme.text.secondary,
                    fontWeight: "500",
                    marginBottom: "0.25rem",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "700",
                    color: theme.text.primary,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Projets en cours */}
      <h2
        style={{
          color: theme.text.primary,
          marginBottom: "1.5rem",
          fontSize: "1.5rem",
        }}
      >
        Projets en cours
      </h2>
      {projetsEnCours.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: theme.bg.card,
            borderRadius: "12px",
            border: `1px dashed ${theme.border.medium}`,
            marginBottom: "2.5rem",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
          <p style={{ color: theme.text.secondary, margin: 0 }}>
            Aucun projet en cours pour le moment.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2.5rem" }}>
          {projetsEnCours.map((projet) => (
            <Link
              key={projet.id}
              to={`/projets/${projet.id}`}
              style={{
                padding: "2rem",
                backgroundColor: theme.bg.card,
                border: `2px solid ${theme.colors.primary}40`,
                borderRadius: "16px",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.2s",
                boxShadow: theme.shadow.md,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = theme.shadow.xl;
                e.currentTarget.style.borderColor = theme.colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = theme.shadow.md;
                e.currentTarget.style.borderColor = `${theme.colors.primary}40`;
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: "0.75rem",
                      color: theme.text.primary,
                      fontSize: "1.3rem",
                      fontWeight: "600",
                    }}
                  >
                    {projet.titre}
                  </h3>
                  <div style={{ fontSize: "0.95rem", color: theme.text.secondary }}>
                    {projet.type && (
                      <span style={{ marginRight: "1.5rem" }}>
                        📋 Type: <strong>{projet.type}</strong>
                      </span>
                    )}
                    {projet.pole_name && (
                      <span>🎯 Pôle: <strong>{projet.pole_name}</strong></span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: `${theme.colors.primary}20`,
                    color: theme.colors.primary,
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    border: `1px solid ${theme.colors.primary}40`,
                    whiteSpace: "nowrap",
                  }}
                >
                  ⚡ En cours
                </div>
              </div>

              <div
                style={{
                  fontSize: "0.9rem",
                  color: theme.text.secondary,
                  marginBottom: "1rem",
                  paddingTop: "1rem",
                  borderTop: `1px solid ${theme.border.light}`,
                }}
              >
                {projet.chef_projet_username && (
                  <div style={{ marginBottom: "0.5rem" }}>
                    👤 Chef de projet: <strong style={{ color: theme.text.primary }}>{projet.chef_projet_username}</strong>
                  </div>
                )}
                <div>
                  ✓ {projet.nombre_taches || 0} tâches · 👥 {projet.nombre_membres || 0} membres
                </div>
              </div>

              {projet.date_debut && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: theme.text.tertiary,
                    paddingTop: "0.75rem",
                    borderTop: `1px solid ${theme.border.light}`,
                  }}
                >
                  📅 Démarré le {new Date(projet.date_debut).toLocaleDateString("fr-FR")}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Tous les projets */}
      <h2
        style={{
          color: theme.text.primary,
          marginBottom: "1.5rem",
          fontSize: "1.5rem",
        }}
      >
        Tous mes projets
      </h2>
      {mesProjets.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: theme.bg.card,
            borderRadius: "12px",
            border: `1px dashed ${theme.border.medium}`,
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
          <p style={{ color: theme.text.secondary, margin: 0 }}>
            Vous n'avez pas encore de projets.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {mesProjets.map((projet) => {
            const statusConfig = {
              en_cours: { color: theme.colors.primary, label: "En cours", icon: "⚡" },
              termine: { color: theme.colors.success, label: "Terminé", icon: "✓" },
              en_attente: { color: theme.colors.warning, label: "En attente", icon: "⏳" },
              brouillon: { color: theme.text.secondary, label: "Brouillon", icon: "📝" },
            };
            const config = statusConfig[projet.statut] || statusConfig.brouillon;

            return (
              <Link
                key={projet.id}
                to={`/projets/${projet.id}`}
                style={{
                  padding: "1.5rem",
                  backgroundColor: theme.bg.card,
                  border: `1px solid ${theme.border.light}`,
                  borderRadius: "12px",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.2s",
                  boxShadow: theme.shadow.sm,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = theme.shadow.lg;
                  e.currentTarget.style.borderColor = theme.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = theme.shadow.sm;
                  e.currentTarget.style.borderColor = theme.border.light;
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                    marginBottom: "0.75rem",
                    fontSize: "1.1rem",
                    color: theme.text.primary,
                  }}
                >
                  {projet.titre}
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: theme.text.secondary,
                    marginBottom: "1rem",
                  }}
                >
                  {projet.nombre_taches || 0} tâches · {projet.nombre_membres || 0} membres
                </div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "0.5rem 1rem",
                    backgroundColor: `${config.color}20`,
                    color: config.color,
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    border: `1px solid ${config.color}40`,
                  }}
                >
                  {config.icon} {config.label}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
