import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { fetchProjets } from "../api/projets";
import { fetchTaches } from "../api/taches";

export default function MembreDashboard() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
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
          <div>Chargement de votre espace...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            margin: 0,
            marginBottom: "0.5rem",
            color: theme.text.primary,
            fontSize: "2rem",
          }}
        >
          Mon Espace
        </h1>
        <p style={{ margin: 0, color: theme.text.secondary, fontSize: "1.05rem" }}>
          Bienvenue, <strong style={{ color: theme.text.primary }}>{user?.username}</strong>
        </p>
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
            padding: "1.25rem",
            backgroundColor: theme.colors.purple,
            color: theme.text.inverse,
            textDecoration: "none",
            borderRadius: "12px",
            textAlign: "center",
            fontWeight: "600",
            fontSize: "1.05rem",
            transition: "all 0.2s",
            boxShadow: theme.shadow.sm,
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = theme.shadow.lg;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = theme.shadow.sm;
          }}
        >
          📁 Mes projets
        </Link>
        <Link
          to="/kanban"
          style={{
            padding: "1.25rem",
            backgroundColor: theme.colors.info,
            color: theme.text.inverse,
            textDecoration: "none",
            borderRadius: "12px",
            textAlign: "center",
            fontWeight: "600",
            fontSize: "1.05rem",
            transition: "all 0.2s",
            boxShadow: theme.shadow.sm,
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = theme.shadow.lg;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = theme.shadow.sm;
          }}
        >
          📊 Kanban des tâches
        </Link>
      </div>

      {/* Statistiques */}
      <h2
        style={{
          color: theme.text.primary,
          marginBottom: "1.5rem",
          fontSize: "1.5rem",
        }}
      >
        Mes tâches
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
          { icon: "📋", label: "À faire", value: mesTachesAFaire.length, color: theme.text.secondary },
          { icon: "⚡", label: "En cours", value: mesTachesEnCours.length, color: theme.colors.primary },
          { icon: "✓", label: "Terminées", value: mesTachesTerminees.length, color: theme.colors.success },
          { icon: "📁", label: "Projets", value: projets.length, color: theme.colors.purple },
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

      {/* Mes tâches à faire */}
      <h2
        style={{
          color: theme.text.primary,
          marginBottom: "1.5rem",
          fontSize: "1.5rem",
        }}
      >
        Mes tâches à faire
      </h2>
      {mesTachesAFaire.length === 0 ? (
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
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
          <p style={{ color: theme.text.secondary, margin: 0 }}>
            Vous n'avez aucune tâche à faire pour le moment. Excellent travail !
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginBottom: "2.5rem" }}>
          {mesTachesAFaire.map((tache) => {
            const priorityConfig = {
              urgente: { color: theme.colors.danger, icon: "🔥", label: "Urgente" },
              haute: { color: theme.colors.warning, icon: "⚠️", label: "Haute" },
              normale: { color: theme.colors.primary, icon: "📌", label: "Normale" },
              basse: { color: theme.text.secondary, icon: "📝", label: "Basse" },
            };
            const config = priorityConfig[tache.priorite] || priorityConfig.basse;

            return (
              <div
                key={tache.id}
                style={{
                  padding: "1.5rem",
                  backgroundColor: theme.bg.card,
                  border: `1px solid ${theme.border.light}`,
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                  boxShadow: theme.shadow.sm,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadow.md;
                  e.currentTarget.style.borderColor = theme.border.medium;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadow.sm;
                  e.currentTarget.style.borderColor = theme.border.light;
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      color: theme.text.primary,
                      fontSize: "1.05rem",
                    }}
                  >
                    {tache.titre}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: theme.text.secondary }}>
                    {tache.projet_details?.titre || "Projet inconnu"}
                    {tache.deadline && (
                      <span> · Deadline: {new Date(tache.deadline).toLocaleDateString("fr-FR")}</span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: `${config.color}20`,
                    color: config.color,
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    marginLeft: "1rem",
                    border: `1px solid ${config.color}40`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {config.icon} {config.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mes tâches en cours */}
      <h2
        style={{
          color: theme.text.primary,
          marginBottom: "1.5rem",
          fontSize: "1.5rem",
        }}
      >
        Mes tâches en cours
      </h2>
      {mesTachesEnCours.length === 0 ? (
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
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💤</div>
          <p style={{ color: theme.text.secondary, margin: 0 }}>
            Aucune tâche en cours pour le moment.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginBottom: "2.5rem" }}>
          {mesTachesEnCours.map((tache) => (
            <div
              key={tache.id}
              style={{
                padding: "1.5rem",
                backgroundColor: `${theme.colors.primary}08`,
                border: `2px solid ${theme.colors.primary}40`,
                borderRadius: "12px",
                transition: "all 0.2s",
                boxShadow: theme.shadow.sm,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme.shadow.md;
                e.currentTarget.style.borderColor = theme.colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = theme.shadow.sm;
                e.currentTarget.style.borderColor = `${theme.colors.primary}40`;
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: theme.text.primary,
                  fontSize: "1.05rem",
                }}
              >
                ⚡ {tache.titre}
              </div>
              <div style={{ fontSize: "0.9rem", color: theme.text.secondary }}>
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
      <h2
        style={{
          color: theme.text.primary,
          marginBottom: "1.5rem",
          fontSize: "1.5rem",
        }}
      >
        Mes projets
      </h2>
      {projets.length === 0 ? (
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
            Vous n'êtes assigné à aucun projet.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {projets.map((projet) => {
            const statusConfig = {
              en_cours: { color: theme.colors.primary, label: "En cours" },
              termine: { color: theme.colors.success, label: "Terminé" },
              brouillon: { color: theme.text.secondary, label: "Brouillon" },
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
                    color: theme.text.primary,
                    fontSize: "1.1rem",
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
                  {config.label}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
