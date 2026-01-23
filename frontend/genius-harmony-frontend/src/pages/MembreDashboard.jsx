import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";
import { fetchProjets } from "../api/projets";
import { fetchTaches } from "../api/taches";

export default function MembreDashboard() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const { isMobile, isTablet, isSmallScreen } = useResponsive();
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

        // Filtrer les projets pour le dashboard: uniquement ceux où l'utilisateur est assigné
        const mesProjets = projetsData.filter(projet => {
          // Membre du projet (vérifier si l'ID de l'utilisateur est dans la liste des membres)
          const estMembre = projet.membres?.includes(user.id);
          // Chef de projet
          const estChef = projet.chef_projet === user.id;
          // Client du projet
          const estClient = projet.client === user.id;
          // Créateur du projet
          const estCreateur = projet.created_by === user.id;

          return estMembre || estChef || estClient || estCreateur;
        });

        setProjets(mesProjets);
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
      <div style={{ marginBottom: isMobile ? "2rem" : "3rem", textAlign: "center" }}>
        <h1
          style={{
            margin: 0,
            marginBottom: "0.75rem",
            color: "#fff",
            fontSize: isMobile ? "1.5rem" : "2.2rem",
          }}
        >
          Mon Espace
        </h1>
        <p style={{ margin: 0, color: "#c4b5fd", fontSize: isMobile ? "0.95rem" : "1.1rem" }}>
          Bienvenue, <strong style={{ color: "#fff" }}>{user?.username}</strong>
        </p>
      </div>

      {/* Statistiques */}
      <h2
        style={{
          color: "#fff",
          marginBottom: isMobile ? "1rem" : "1.5rem",
          fontSize: isMobile ? "1.2rem" : "1.5rem",
        }}
      >
        Mes tâches
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? "1rem" : "1.5rem",
          marginBottom: isMobile ? "1.5rem" : "2.5rem",
        }}
      >
        {[
          { icon: "📋", label: "À faire", value: mesTachesAFaire.length, color: theme.text.secondary, link: "/taches/kanban" },
          { icon: "⚡", label: "En cours", value: mesTachesEnCours.length, color: theme.colors.primary, link: "/taches/kanban" },
          { icon: "✓", label: "Terminées", value: mesTachesTerminees.length, color: theme.colors.success, link: "/taches/kanban" },
          { icon: "📁", label: "Projets", value: projets.length, color: theme.colors.purple, link: "/projets" },
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
          </Link>
        ))}
      </div>

      {/* Mes tâches à faire */}
      <h2
        style={{
          color: "#fff",
          marginBottom: isMobile ? "1rem" : "1.5rem",
          fontSize: isMobile ? "1.2rem" : "1.5rem",
        }}
      >
        Mes tâches à faire
      </h2>
      {mesTachesAFaire.length === 0 ? (
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
          <div style={{ fontSize: isMobile ? "2rem" : "3rem", marginBottom: "1rem" }}>🎉</div>
          <p style={{ color: theme.text.secondary, margin: 0, fontSize: isMobile ? "0.9rem" : "1rem" }}>
            Vous n'avez aucune tâche à faire pour le moment. Excellent travail !
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginBottom: isMobile ? "1.5rem" : "2.5rem" }}>
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
                    backgroundColor: `${config.color}20`,
                    color: config.color,
                    borderRadius: "8px",
                    fontSize: isMobile ? "0.8rem" : "0.85rem",
                    fontWeight: "600",
                    marginLeft: isSmallScreen ? "0" : "1rem",
                    border: `1px solid ${config.color}40`,
                    whiteSpace: "nowrap",
                    alignSelf: isSmallScreen ? "flex-start" : "auto",
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
          color: "#fff",
          marginBottom: isMobile ? "1rem" : "1.5rem",
          fontSize: isMobile ? "1.2rem" : "1.5rem",
        }}
      >
        Mes tâches en cours
      </h2>
      {mesTachesEnCours.length === 0 ? (
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
          <div style={{ fontSize: isMobile ? "2rem" : "3rem", marginBottom: "1rem" }}>💤</div>
          <p style={{ color: theme.text.secondary, margin: 0, fontSize: isMobile ? "0.9rem" : "1rem" }}>
            Aucune tâche en cours pour le moment.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginBottom: isMobile ? "1.5rem" : "2.5rem" }}>
          {mesTachesEnCours.map((tache) => (
            <div
              key={tache.id}
              style={{
                padding: isMobile ? "1rem" : "1.5rem",
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
                  fontSize: isMobile ? "0.95rem" : "1.05rem",
                }}
              >
                ⚡ {tache.titre}
              </div>
              <div style={{ fontSize: isMobile ? "0.85rem" : "0.9rem", color: theme.text.secondary }}>
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
          color: "#fff",
          marginBottom: isMobile ? "1rem" : "1.5rem",
          fontSize: isMobile ? "1.2rem" : "1.5rem",
        }}
      >
        Mes projets
      </h2>
      {projets.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: isMobile ? "2rem" : "3rem",
            backgroundColor: theme.bg.card,
            borderRadius: "12px",
            border: `1px dashed ${theme.border.medium}`,
          }}
        >
          <div style={{ fontSize: isMobile ? "2rem" : "3rem", marginBottom: "1rem" }}>📂</div>
          <p style={{ color: theme.text.secondary, margin: 0, fontSize: isMobile ? "0.9rem" : "1rem" }}>
            Vous n'êtes assigné à aucun projet.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: isMobile ? "1rem" : "2rem" }}>
          {projets.map((projet) => {
            const statusConfig = {
              en_cours: { color: theme.colors.primary, label: "En cours" },
              en_revision: { color: theme.colors.warning, label: "En révision" },
              termine: { color: theme.colors.success, label: "Terminé" },
              brouillon: { color: theme.text.secondary, label: "Brouillon" },
              en_attente: { color: theme.colors.orange, label: "En attente" },
              annule: { color: theme.colors.danger, label: "Annulé" },
            };
            const config = statusConfig[projet.statut] || statusConfig.brouillon;

            return (
              <Link
                key={projet.id}
                to={`/projets/${projet.id}`}
                style={{
                  padding: isMobile ? "1.25rem" : "2rem",
                  backgroundColor: theme.bg.card,
                  border: `1px solid ${theme.border.light}`,
                  borderRadius: isMobile ? "12px" : "16px",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.2s",
                  boxShadow: theme.shadow.sm,
                  display: "flex",
                  flexDirection: "column",
                  gap: isMobile ? "1rem" : "1.25rem",
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
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      color: theme.text.primary,
                      fontSize: isMobile ? "1rem" : "1.2rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {projet.titre}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                      color: theme.text.secondary,
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? "0.5rem" : "1rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    <span>📋 {projet.nombre_taches || 0} tâches</span>
                    <span>·</span>
                    <span>👥 {projet.nombre_membres || 0} membres</span>
                  </div>
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    alignSelf: "flex-start",
                    padding: isMobile ? "0.5rem 1rem" : "0.6rem 1.2rem",
                    backgroundColor: `${config.color}20`,
                    color: config.color,
                    borderRadius: "10px",
                    fontSize: isMobile ? "0.8rem" : "0.85rem",
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
