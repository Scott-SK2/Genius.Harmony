import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchTaches, updateTache } from "../api/taches";
import { fetchProjets } from "../api/projets";

const PRIORITE_LABELS = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

export default function KanbanTaches() {
  const { token, user } = useAuth();
  const [taches, setTaches] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  // Filtres
  const [selectedProjet, setSelectedProjet] = useState("");
  const [selectedPriorite, setSelectedPriorite] = useState("");

  // Fonction pour vérifier si l'utilisateur peut déplacer une tâche
  const canDragTask = (tache) => {
    if (!user || !tache) return false;

    // Admin et Super Admin peuvent tout faire
    if (user.role === 'admin' || user.role === 'super_admin') return true;

    // Trouver le projet de la tâche
    const projet = projets.find(p => p.id === tache.projet);
    if (!projet) return false;

    // Chef de pôle peut déplacer les tâches des projets de son pôle
    if (user.role === 'chef_pole' && projet.pole === user.pole) return true;

    // Chef de projet peut déplacer les tâches de son projet
    if (projet.chef_projet === user.id) return true;

    // Personne assignée peut déplacer sa tâche
    if (tache.assigne_a === user.id) return true;

    return false;
  };

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        const [tachesData, projetsData] = await Promise.all([
          fetchTaches(token),
          fetchProjets(token),
        ]);
        setTaches(tachesData);
        setProjets(projetsData);
      } catch (err) {
        console.error("Erreur fetch taches/projets:", err);
        setError("Impossible de charger les tâches");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Charger les tâches avec filtres
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const filters = {};
        if (selectedProjet) filters.projet = selectedProjet;
        if (selectedPriorite) filters.priorite = selectedPriorite;

        const data = await fetchTaches(token, filters);
        setTaches(data);
      } catch (err) {
        console.error("Erreur fetch taches avec filtres:", err);
      }
    })();
  }, [selectedProjet, selectedPriorite, token]);

  const COLONNES = [
    { id: "a_faire", label: "À faire", color: "#a78bfa" },
    { id: "en_cours", label: "En cours", color: "#7c3aed" },
    { id: "termine", label: "Terminé", color: "#10b981" },
  ];

  const PRIORITE_COLORS = {
    basse: "#a78bfa",
    normale: "#7c3aed",
    haute: "#f59e0b",
    urgente: "#f87171",
  };

  // Grouper les tâches par statut
  const tachesParStatut = COLONNES.reduce((acc, col) => {
    acc[col.id] = taches.filter((t) => t.statut === col.id);
    return acc;
  }, {});

  // Drag & Drop handlers
  const handleDragStart = (e, tache) => {
    // Vérifier si l'utilisateur peut déplacer cette tâche
    if (!canDragTask(tache)) {
      e.preventDefault();
      return;
    }

    setDraggedTask(tache);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, nouveauStatut) => {
    e.preventDefault();

    if (!draggedTask) return;

    // Si le statut n'a pas changé, ne rien faire
    if (draggedTask.statut === nouveauStatut) return;

    try {
      // Mettre à jour le statut de la tâche
      const updated = await updateTache(token, draggedTask.id, {
        statut: nouveauStatut,
      });

      // Mettre à jour localement
      setTaches((prev) =>
        prev.map((t) => (t.id === draggedTask.id ? { ...t, statut: nouveauStatut } : t))
      );
    } catch (err) {
      console.error("Erreur update tache:", err);
      alert("Impossible de déplacer la tâche");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <div style={{ color: "#c4b5fd" }}>Chargement du Kanban...</div>
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

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      <h1 style={{ margin: 0, marginBottom: "0.5rem", color: "#fff", fontSize: "2rem" }}>
        📊 Kanban - Gestion des Tâches
      </h1>
      <p style={{ margin: 0, marginBottom: "2rem", color: "#c4b5fd", fontSize: "1.05rem" }}>
        Glissez-déposez les tâches pour changer leur statut
      </p>

      {/* Filtres */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          padding: "1.5rem",
          backgroundColor: "#2d1b69",
          borderRadius: "12px",
          border: "1px solid #4c1d95",
        }}
      >
        <div style={{ flex: 1 }}>
          <label
            htmlFor="filter-projet"
            style={{
              display: "block",
              marginBottom: "0.75rem",
              fontWeight: "600",
              color: "#c4b5fd",
            }}
          >
            🔍 Filtrer par projet
          </label>
          <select
            id="filter-projet"
            value={selectedProjet}
            onChange={(e) => setSelectedProjet(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #4c1d95",
              backgroundColor: "#1e1b4b",
              color: "#fff",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            <option value="">Tous les projets</option>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label
            htmlFor="filter-priorite"
            style={{
              display: "block",
              marginBottom: "0.75rem",
              fontWeight: "600",
              color: "#c4b5fd",
            }}
          >
            ⚡ Filtrer par priorité
          </label>
          <select
            id="filter-priorite"
            value={selectedPriorite}
            onChange={(e) => setSelectedPriorite(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #4c1d95",
              backgroundColor: "#1e1b4b",
              color: "#fff",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            <option value="">Toutes les priorités</option>
            <option value="basse">Basse</option>
            <option value="normale">Normale</option>
            <option value="haute">Haute</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        {(selectedProjet || selectedPriorite) && (
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={() => {
                setSelectedProjet("");
                setSelectedPriorite("");
              }}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#f87171",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#ef4444";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#f87171";
                e.target.style.transform = "translateY(0)";
              }}
            >
              ✕ Réinitialiser
            </button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <div
          style={{
            backgroundColor: "#2d1b69",
            borderRadius: "16px",
            padding: "2rem",
            border: "1px solid #4c1d95",
            transition: "all 0.3s",
            boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "12px",
                backgroundColor: "#4c1d95",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
              }}
            >
              📋
            </div>
            <div>
              <div style={{ fontSize: "0.9rem", color: "#c4b5fd", fontWeight: "500", marginBottom: "0.25rem" }}>
                Total tâches
              </div>
              <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#fff", lineHeight: 1 }}>
                {taches.length}
              </div>
            </div>
          </div>
        </div>
        {COLONNES.map((col) => {
          const icons = {
            a_faire: "📝",
            en_cours: "⚡",
            termine: "✓",
          };
          return (
            <div
              key={col.id}
              style={{
                backgroundColor: "#2d1b69",
                borderRadius: "16px",
                padding: "2rem",
                border: "1px solid #4c1d95",
                transition: "all 0.3s",
                boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "12px",
                    backgroundColor: `${col.color}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2rem",
                  }}
                >
                  {icons[col.id]}
                </div>
                <div>
                  <div style={{ fontSize: "0.9rem", color: "#c4b5fd", fontWeight: "500", marginBottom: "0.25rem" }}>
                    {col.label}
                  </div>
                  <div style={{ fontSize: "2.5rem", fontWeight: "700", color: "#fff", lineHeight: 1 }}>
                    {tachesParStatut[col.id]?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Board Kanban */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          minHeight: "500px",
        }}
      >
        {COLONNES.map((colonne) => (
          <div
            key={colonne.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, colonne.id)}
            style={{
              backgroundColor: "#2d1b69",
              borderRadius: "16px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #4c1d95",
            }}
          >
            {/* En-tête de colonne */}
            <div
              style={{
                backgroundColor: colonne.color,
                color: "#fff",
                padding: "1rem 1.25rem",
                borderRadius: "12px",
                marginBottom: "1.5rem",
                fontWeight: "700",
                fontSize: "1.05rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <span>{colonne.label}</span>
              <span
                style={{
                  backgroundColor: "rgba(255,255,255,0.25)",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                }}
              >
                {tachesParStatut[colonne.id]?.length || 0}
              </span>
            </div>

            {/* Liste des tâches */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {tachesParStatut[colonne.id]?.map((tache) => (
                <div
                  key={tache.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tache)}
                  onDragEnd={handleDragEnd}
                  style={{
                    backgroundColor: "#1e1b4b",
                    padding: "1.25rem",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
                    cursor: "grab",
                    border: "1px solid #4c1d95",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
                    e.currentTarget.style.borderColor = "#a78bfa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
                    e.currentTarget.style.borderColor = "#4c1d95";
                  }}
                >
                  {/* Titre de la tâche */}
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.75rem",
                      fontSize: "1.05rem",
                      color: "#fff",
                      lineHeight: "1.4",
                    }}
                  >
                    {tache.titre}
                  </div>

                  {/* Badge priorité */}
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.4rem 0.75rem",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        backgroundColor: `${PRIORITE_COLORS[tache.priorite] || "#a78bfa"}33`,
                        color: PRIORITE_COLORS[tache.priorite] || "#a78bfa",
                        border: `1px solid ${PRIORITE_COLORS[tache.priorite] || "#a78bfa"}`,
                      }}
                    >
                      {PRIORITE_LABELS[tache.priorite] || tache.priorite}
                    </span>
                  </div>

                  {/* Informations supplémentaires */}
                  <div style={{ fontSize: "0.9rem", color: "#c4b5fd", lineHeight: "1.6" }}>
                    {tache.projet_details && (
                      <div style={{ marginBottom: "0.5rem" }}>📁 {tache.projet_details.titre}</div>
                    )}
                    {tache.assigne_a_details && (
                      <div style={{ marginBottom: "0.5rem" }}>👤 {tache.assigne_a_details.username}</div>
                    )}
                    {tache.deadline && (
                      <div>📅 {new Date(tache.deadline).toLocaleDateString("fr-FR")}</div>
                    )}
                  </div>
                </div>
              ))}

              {/* Message si aucune tâche */}
              {(!tachesParStatut[colonne.id] || tachesParStatut[colonne.id].length === 0) && (
                <div
                  style={{
                    padding: "3rem 1.5rem",
                    textAlign: "center",
                    color: "#a78bfa",
                    fontSize: "1rem",
                    border: "2px dashed #4c1d95",
                    borderRadius: "12px",
                    backgroundColor: "rgba(76, 29, 149, 0.2)",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
                  <div>Aucune tâche</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
