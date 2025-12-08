// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { fetchPoles, createPole, updatePole, deletePole } from "../api/poles";
import { fetchProjets } from "../api/projets";
import { fetchTaches } from "../api/taches";
import { fetchUsers } from "../api/users";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const [poles, setPoles] = useState([]);
  const [stats, setStats] = useState({
    totalProjets: 0,
    totalTaches: 0,
    totalUtilisateurs: 0,
    projetsEnCours: 0,
    tachesAFaire: 0,
    tachesEnCours: 0,
  });
  const [newPole, setNewPole] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);

  // Charger les données au chargement
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        const [polesData, projetsData, tachesData, usersData] = await Promise.all([
          fetchPoles(token),
          fetchProjets(token),
          fetchTaches(token),
          fetchUsers(token),
        ]);

        setPoles(polesData);

        // Calculer les statistiques
        setStats({
          totalProjets: projetsData.length,
          totalTaches: tachesData.length,
          totalUtilisateurs: usersData.length,
          projetsEnCours: projetsData.filter((p) => p.statut === "en_cours").length,
          tachesAFaire: tachesData.filter((t) => t.statut === "a_faire").length,
          tachesEnCours: tachesData.filter((t) => t.statut === "en_cours").length,
        });
      } catch (err) {
        console.error("Erreur fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Création d'un nouveau pôle
  async function handleCreate(e) {
    e.preventDefault();
    if (!newPole.name.trim()) return;

    try {
      const created = await createPole(token, newPole);
      setPoles((prev) => [...prev, created]);
      setNewPole({ name: "", description: "" });
    } catch (err) {
      console.error("Erreur create pole:", err);
      alert("Impossible de créer le pôle");
    }
  }

  // Lancer l'édition
  function startEdit(pole) {
    setEditingId(pole.id);
    setEditingData({ name: pole.name, description: pole.description || "" });
  }

  // Annuler l'édition
  function cancelEdit() {
    setEditingId(null);
    setEditingData({ name: "", description: "" });
  }

  // Sauvegarder l'édition
  async function saveEdit(id) {
    if (!editingData.name.trim()) return;
    try {
      const updated = await updatePole(token, id, editingData);
      setPoles((prev) => prev.map((p) => (p.id === id ? updated : p)));
      cancelEdit();
    } catch (err) {
      console.error("Erreur update pole:", err);
      alert("Impossible de modifier le pôle");
    }
  }

  // Supprimer un pôle
  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce pôle ?")) return;
    try {
      await deletePole(token, id);
      setPoles((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erreur delete pole:", err);
      alert("Impossible de supprimer le pôle");
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
        <div style={{ color: theme.text.secondary }}>Chargement du dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      icon: "📁",
      label: "Projets",
      value: stats.totalProjets,
      subtitle: `${stats.projetsEnCours} en cours`,
      color: theme.colors.primary,
      link: "/projets",
    },
    {
      icon: "✓",
      label: "Tâches",
      value: stats.totalTaches,
      subtitle: `${stats.tachesAFaire} à faire, ${stats.tachesEnCours} en cours`,
      color: theme.colors.info,
      link: "/kanban",
    },
    {
      icon: "👥",
      label: "Utilisateurs",
      value: stats.totalUtilisateurs,
      subtitle: "Membres de l'équipe",
      color: theme.colors.warning,
      link: "/admin/users",
    },
    {
      icon: "🎯",
      label: "Pôles",
      value: poles.length,
      subtitle: "Départements actifs",
      color: theme.colors.purple,
    },
  ];

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, marginBottom: "0.5rem", color: theme.text.primary, fontSize: "2rem" }}>
          Dashboard Administrateur
        </h1>
        <p style={{ margin: 0, color: theme.text.secondary }}>
          Vue d'ensemble de Genius.Harmony
        </p>
      </div>

      {/* Statistiques */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link || "#"}
            style={{
              textDecoration: "none",
              backgroundColor: theme.bg.card,
              padding: "1.5rem",
              borderRadius: "12px",
              border: `1px solid ${theme.border.light}`,
              boxShadow: theme.shadow.sm,
              transition: "all 0.3s",
              cursor: card.link ? "pointer" : "default",
            }}
            onMouseEnter={(e) => {
              if (card.link) {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = theme.shadow.lg;
                e.currentTarget.style.borderColor = card.color;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = theme.shadow.sm;
              e.currentTarget.style.borderColor = theme.border.light;
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div
                style={{
                  fontSize: "2.5rem",
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: `${card.color}20`,
                  borderRadius: "12px",
                }}
              >
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", color: theme.text.secondary, marginBottom: "0.25rem" }}>
                  {card.label}
                </div>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: theme.text.primary }}>
                  {card.value}
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.85rem", color: theme.text.tertiary }}>
              {card.subtitle}
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation rapide */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "3rem",
        }}
      >
        <Link
          to="/admin/users"
          style={{
            padding: "1rem",
            backgroundColor: theme.colors.primary,
            color: theme.text.inverse,
            textDecoration: "none",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = theme.shadow.md;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          👥 Gérer les utilisateurs
        </Link>
        <Link
          to="/projets"
          style={{
            padding: "1rem",
            backgroundColor: theme.colors.purple,
            color: theme.text.inverse,
            textDecoration: "none",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = theme.shadow.md;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          📁 Voir les projets
        </Link>
        <Link
          to="/kanban"
          style={{
            padding: "1rem",
            backgroundColor: theme.colors.info,
            color: theme.text.inverse,
            textDecoration: "none",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = theme.shadow.md;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          📊 Kanban des tâches
        </Link>
      </div>

      <hr style={{ border: "none", borderTop: `1px solid ${theme.border.light}`, margin: "3rem 0" }} />

      {/* Gestion des pôles */}
      <div>
        <h2 style={{ color: theme.text.primary, marginBottom: "1.5rem" }}>Gestion des Pôles</h2>

        {poles.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              backgroundColor: theme.bg.tertiary,
              borderRadius: "12px",
              border: `2px dashed ${theme.border.medium}`,
              color: theme.text.secondary,
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
            <p>Aucun pôle pour l'instant.</p>
            <p style={{ fontSize: "0.9rem" }}>Créez votre premier pôle ci-dessous.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
            {poles.map((pole) => (
              <div
                key={pole.id}
                style={{
                  backgroundColor: theme.bg.card,
                  border: `1px solid ${theme.border.light}`,
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: theme.shadow.sm,
                }}
              >
                {editingId === pole.id ? (
                  <>
                    <input
                      type="text"
                      value={editingData.name}
                      onChange={(e) => setEditingData((d) => ({ ...d, name: e.target.value }))}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: `1px solid ${theme.border.medium}`,
                        marginBottom: "1rem",
                        fontSize: "1rem",
                        backgroundColor: theme.bg.tertiary,
                        color: theme.text.primary,
                      }}
                    />
                    <textarea
                      value={editingData.description}
                      onChange={(e) =>
                        setEditingData((d) => ({
                          ...d,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: `1px solid ${theme.border.medium}`,
                        marginBottom: "1rem",
                        fontSize: "1rem",
                        backgroundColor: theme.bg.tertiary,
                        color: theme.text.primary,
                      }}
                    />
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button
                        type="button"
                        onClick={() => saveEdit(pole.id)}
                        style={{
                          padding: "0.6rem 1.2rem",
                          backgroundColor: theme.colors.success,
                          color: theme.text.inverse,
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "500",
                        }}
                      >
                        Sauvegarder
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        style={{
                          padding: "0.6rem 1.2rem",
                          backgroundColor: theme.bg.tertiary,
                          color: theme.text.primary,
                          border: `1px solid ${theme.border.medium}`,
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "500",
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ marginBottom: "1rem" }}>
                      <h3 style={{ margin: 0, marginBottom: "0.5rem", color: theme.text.primary }}>
                        {pole.name}
                      </h3>
                      {pole.description && (
                        <p style={{ margin: 0, color: theme.text.secondary, fontSize: "0.95rem" }}>
                          {pole.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button
                        type="button"
                        onClick={() => startEdit(pole)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: theme.colors.primary,
                          color: theme.text.inverse,
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                        }}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(pole.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: theme.colors.danger,
                          color: theme.text.inverse,
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: "500",
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formulaire d'ajout */}
        <div
          style={{
            backgroundColor: theme.bg.card,
            padding: "2rem",
            borderRadius: "12px",
            border: `1px solid ${theme.border.light}`,
            boxShadow: theme.shadow.sm,
          }}
        >
          <h3 style={{ marginTop: 0, color: theme.text.primary }}>Ajouter un pôle</h3>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: theme.text.primary }}>
                Nom du pôle *
              </label>
              <input
                type="text"
                placeholder="Ex: Cinéma, Musique, Événements..."
                value={newPole.name}
                onChange={(e) => setNewPole((p) => ({ ...p, name: e.target.value }))}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: `1px solid ${theme.border.medium}`,
                  fontSize: "1rem",
                  backgroundColor: theme.bg.tertiary,
                  color: theme.text.primary,
                }}
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: theme.text.primary }}>
                Description
              </label>
              <textarea
                placeholder="Description optionnelle du pôle..."
                value={newPole.description}
                onChange={(e) => setNewPole((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: `1px solid ${theme.border.medium}`,
                  fontSize: "1rem",
                  backgroundColor: theme.bg.tertiary,
                  color: theme.text.primary,
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: theme.colors.success,
                color: theme.text.inverse,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = theme.shadow.md;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              Créer le pôle
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
