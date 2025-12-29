import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";
import { fetchProjets } from "../api/projets";
import { fetchTaches } from "../api/taches";

export default function ChefPoleDashboard() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const { isMobile, isTablet, isSmallScreen } = useResponsive();
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
          <div>Chargement du dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom: isMobile ? "2rem" : "3rem", textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            marginBottom: "0.75rem",
            color: "#fff",
            fontSize: isMobile ? "1.5rem" : "2.2rem",
          }}
        >
          Dashboard Chef de Pôle
        </h1>
        <p style={{ margin: 0, color: "#c4b5fd", fontSize: isMobile ? "0.95rem" : "1.1rem" }}>
          Bienvenue, <strong style={{ color: "#fff" }}>{user?.username}</strong>
        </p>
        {user?.pole_name && (
          <p
            style={{
              margin: 0,
              color: theme.colors.secondary,
              fontWeight: "600",
              marginTop: "0.75rem",
              fontSize: isMobile ? "0.95rem" : "1.1rem",
            }}
          >
            🎯 Pôle : {user.pole_name}
          </p>
        )}
      </div>

      {/* Statistiques */}
      <h2
        style={{
          color: "#fff",
          marginBottom: isMobile ? "1rem" : "1.5rem",
          fontSize: isMobile ? "1.2rem" : "1.5rem",
        }}
      >
        Vue d'ensemble de mon pôle
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(2, 1fr)",
          gap: isMobile ? "1rem" : "1.5rem",
          marginBottom: isMobile ? "1.5rem" : "2.5rem",
        }}
      >
        {[
          {
            icon: "📁",
            label: "Projets",
            value: projets.length,
            subtitle: `${projetsEnCours.length} en cours`,
            color: theme.colors.primary,
            link: "/projets",
          },
          {
            icon: "✓",
            label: "Tâches",
            value: taches.length,
            subtitle: `${tachesAFaire.length} à faire, ${tachesEnCours.length} en cours`,
            color: theme.colors.info,
            link: "/taches/kanban",
          },
        ].map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            style={{
              backgroundColor: theme.bg.card,
              borderRadius: isMobile ? "12px" : "16px",
              padding: isMobile ? "1.25rem" : "2rem",
              boxShadow: theme.shadow.md,
              border: `1px solid ${theme.border.light}`,
              transition: "all 0.3s",
              cursor: "pointer",
              textDecoration: "none",
              display: "block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = theme.shadow.xl;
              e.currentTarget.style.borderColor = stat.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = theme.shadow.md;
              e.currentTarget.style.borderColor = theme.border.light;
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  width: isMobile ? "50px" : "60px",
                  height: isMobile ? "50px" : "60px",
                  borderRadius: "12px",
                  backgroundColor: `${stat.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "1.5rem" : "2rem",
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                    color: theme.text.secondary,
                    fontWeight: "500",
                    marginBottom: "0.25rem",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "1.8rem" : "2.5rem",
                    fontWeight: "700",
                    color: theme.text.primary,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: isMobile ? "0.85rem" : "0.9rem",
                color: theme.text.secondary,
                paddingTop: isMobile ? "0.75rem" : "1rem",
                borderTop: `1px solid ${theme.border.light}`,
              }}
            >
              {stat.subtitle}
            </div>
          </Link>
        ))}
      </div>

      {/* Projets en cours */}
      <h2
        style={{
          color: "#fff",
          marginBottom: isMobile ? "1rem" : "1.5rem",
          fontSize: isMobile ? "1.2rem" : "1.5rem",
        }}
      >
        Projets en cours
      </h2>
      {projetsEnCours.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: isMobile ? "2rem" : "3rem",
            backgroundColor: theme.bg.card,
            borderRadius: "12px",
            border: `1px dashed ${theme.border.medium}`,
            marginBottom: isMobile ? "1.5rem" : "2.5rem",
          }}
        >
          <div style={{ fontSize: isMobile ? "2rem" : "3rem", marginBottom: "1rem" }}>📂</div>
          <p style={{ color: theme.text.secondary, margin: 0, fontSize: isMobile ? "0.9rem" : "1rem" }}>
            Aucun projet en cours pour le moment.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginBottom: isMobile ? "1.5rem" : "2.5rem" }}>
          {projetsEnCours.slice(0, 5).map((projet) => (
            <Link
              key={projet.id}
              to={`/projets/${projet.id}`}
              style={{
                padding: isMobile ? "1rem" : "1.5rem",
                backgroundColor: theme.bg.card,
                border: `1px solid ${theme.border.light}`,
                borderRadius: "12px",
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isSmallScreen ? "flex-start" : "center",
                gap: isSmallScreen ? "0.75rem" : "0",
                transition: "all 0.2s",
                boxShadow: theme.shadow.sm,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(4px)";
                e.currentTarget.style.boxShadow = theme.shadow.md;
                e.currentTarget.style.borderColor = theme.colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
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
                    fontSize: isMobile ? "0.95rem" : "1.05rem",
                  }}
                >
                  {projet.titre}
                </div>
                <div style={{ fontSize: isMobile ? "0.85rem" : "0.9rem", color: theme.text.secondary }}>
                  {projet.nombre_taches || 0} tâches · {projet.nombre_membres || 0} membres
                </div>
              </div>
              <div
                style={{
                  padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
                  backgroundColor: `${theme.colors.primary}20`,
                  color: theme.colors.primary,
                  borderRadius: "8px",
                  fontSize: isMobile ? "0.8rem" : "0.85rem",
                  fontWeight: "600",
                  border: `1px solid ${theme.colors.primary}40`,
                  alignSelf: isSmallScreen ? "flex-start" : "auto",
                }}
              >
                En cours
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Tâches urgentes */}
      <h2
        style={{
          color: "#fff",
          marginBottom: isMobile ? "1rem" : "1.5rem",
          fontSize: isMobile ? "1.2rem" : "1.5rem",
        }}
      >
        Tâches urgentes à traiter
      </h2>
      {tachesAFaire.filter((t) => t.priorite === "urgente" || t.priorite === "haute").length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: isMobile ? "2rem" : "3rem",
            backgroundColor: theme.bg.card,
            borderRadius: "12px",
            border: `1px dashed ${theme.border.medium}`,
          }}
        >
          <div style={{ fontSize: isMobile ? "2rem" : "3rem", marginBottom: "1rem" }}>✅</div>
          <p style={{ color: theme.text.secondary, margin: 0, fontSize: isMobile ? "0.9rem" : "1rem" }}>
            Aucune tâche urgente pour le moment.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {tachesAFaire
            .filter((t) => t.priorite === "urgente" || t.priorite === "haute")
            .slice(0, 5)
            .map((tache) => (
              <div
                key={tache.id}
                style={{
                  padding: isMobile ? "1rem" : "1.5rem",
                  backgroundColor: theme.bg.card,
                  border: `1px solid ${theme.border.light}`,
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: isSmallScreen ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isSmallScreen ? "flex-start" : "center",
                  gap: isSmallScreen ? "0.75rem" : "0",
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
                      fontSize: isMobile ? "0.95rem" : "1.05rem",
                    }}
                  >
                    {tache.titre}
                  </div>
                  <div style={{ fontSize: isMobile ? "0.85rem" : "0.9rem", color: theme.text.secondary }}>
                    {tache.projet_details?.titre || "Projet inconnu"}
                    {tache.deadline && (
                      <span> · Deadline: {new Date(tache.deadline).toLocaleDateString("fr-FR")}</span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    padding: isMobile ? "0.4rem 0.8rem" : "0.5rem 1rem",
                    backgroundColor: tache.priorite === "urgente" ? `${theme.colors.danger}20` : `${theme.colors.warning}20`,
                    color: tache.priorite === "urgente" ? theme.colors.danger : theme.colors.warning,
                    borderRadius: "8px",
                    fontSize: isMobile ? "0.8rem" : "0.85rem",
                    fontWeight: "600",
                    marginLeft: isSmallScreen ? "0" : "1rem",
                    border: `1px solid ${tache.priorite === "urgente" ? theme.colors.danger : theme.colors.warning}40`,
                    whiteSpace: "nowrap",
                    alignSelf: isSmallScreen ? "flex-start" : "auto",
                  }}
                >
                  {tache.priorite === "urgente" ? "🔥 Urgente" : "⚠️ Haute"}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
