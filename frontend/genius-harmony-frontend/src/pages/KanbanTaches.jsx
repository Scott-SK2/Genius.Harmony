import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchTaches, updateTache } from "../api/taches";
import { fetchProjets } from "../api/projets";

const COLONNES = [
  { id: "a_faire", label: "À faire", color: "#95a5a6" },
  { id: "en_cours", label: "En cours", color: "#3498db" },
  { id: "en_revision", label: "En révision", color: "#9b59b6" },
  { id: "terminee", label: "Terminée", color: "#27ae60" },
];

const PRIORITE_COLORS = {
  basse: "#95a5a6",
  normale: "#3498db",
  haute: "#f39c12",
  urgente: "#e74c3c",
};

const PRIORITE_LABELS = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

export default function KanbanTaches() {
  const { token } = useAuth();
  const [taches, setTaches] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  // Filtres
  const [selectedProjet, setSelectedProjet] = useState("");
  const [selectedPriorite, setSelectedPriorite] = useState("");

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

  // Grouper les tâches par statut
  const tachesParStatut = COLONNES.reduce((acc, col) => {
    acc[col.id] = taches.filter((t) => t.statut === col.id);
    return acc;
  }, {});

  // Drag & Drop handlers
  const handleDragStart = (e, tache) => {
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
    return <div style={{ padding: "2rem" }}>Chargement du Kanban...</div>;
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
      <h1>Kanban - Gestion des Tâches</h1>

      {/* Filtres */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          padding: "1rem",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px",
        }}
      >
        <div style={{ flex: 1 }}>
          <label
            htmlFor="filter-projet"
            style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}
          >
            Filtrer par projet
          </label>
          <select
            id="filter-projet"
            value={selectedProjet}
            onChange={(e) => setSelectedProjet(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
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
            style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}
          >
            Filtrer par priorité
          </label>
          <select
            id="filter-priorite"
            value={selectedPriorite}
            onChange={(e) => setSelectedPriorite(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
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
                padding: "0.5rem 1rem",
                backgroundColor: "#e74c3c",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Réinitialiser filtres
            </button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "1rem",
            backgroundColor: "#ecf0f1",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#2c3e50" }}>
            {taches.length}
          </div>
          <div style={{ fontSize: "0.9rem", color: "#7f8c8d" }}>Total tâches</div>
        </div>
        {COLONNES.map((col) => (
          <div
            key={col.id}
            style={{
              flex: 1,
              padding: "1rem",
              backgroundColor: col.color + "20",
              borderRadius: "6px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: "bold", color: col.color }}>
              {tachesParStatut[col.id]?.length || 0}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#7f8c8d" }}>{col.label}</div>
          </div>
        ))}
      </div>

      {/* Board Kanban */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          minHeight: "500px",
        }}
      >
        {COLONNES.map((colonne) => (
          <div
            key={colonne.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, colonne.id)}
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* En-tête de colonne */}
            <div
              style={{
                backgroundColor: colonne.color,
                color: "#fff",
                padding: "0.75rem",
                borderRadius: "6px",
                marginBottom: "1rem",
                fontWeight: "600",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{colonne.label}</span>
              <span
                style={{
                  backgroundColor: "rgba(255,255,255,0.3)",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                }}
              >
                {tachesParStatut[colonne.id]?.length || 0}
              </span>
            </div>

            {/* Liste des tâches */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {tachesParStatut[colonne.id]?.map((tache) => (
                <div
                  key={tache.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tache)}
                  onDragEnd={handleDragEnd}
                  style={{
                    backgroundColor: "#fff",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    cursor: "grab",
                    border: "1px solid #e0e0e0",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                  }}
                >
                  {/* Titre de la tâche */}
                  <div style={{ fontWeight: "500", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                    {tache.titre}
                  </div>

                  {/* Badge priorité */}
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        backgroundColor: PRIORITE_COLORS[tache.priorite] || "#999",
                        color: "#fff",
                      }}
                    >
                      {PRIORITE_LABELS[tache.priorite] || tache.priorite}
                    </span>
                  </div>

                  {/* Informations supplémentaires */}
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    {tache.projet_details && (
                      <div style={{ marginBottom: "0.25rem" }}>
                        📁 {tache.projet_details.titre}
                      </div>
                    )}
                    {tache.assigne_a_details && (
                      <div style={{ marginBottom: "0.25rem" }}>
                        👤 {tache.assigne_a_details.username}
                      </div>
                    )}
                    {tache.deadline && (
                      <div>
                        📅 {new Date(tache.deadline).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Message si aucune tâche */}
              {(!tachesParStatut[colonne.id] || tachesParStatut[colonne.id].length === 0) && (
                <div
                  style={{
                    padding: "2rem 1rem",
                    textAlign: "center",
                    color: "#999",
                    fontSize: "0.9rem",
                    border: "2px dashed #ddd",
                    borderRadius: "6px",
                  }}
                >
                  Aucune tâche
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
