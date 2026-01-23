import { useState } from "react";
import { TACHE_STATUT_LABELS, TACHE_PRIORITE_LABELS, PRIORITE_COLORS } from "../../constants";
import FormTache from "../FormTache";

/**
 * ProjetTasks component - Displays and manages project tasks
 * @param {Object} props
 * @param {Array} props.taches - Array of tasks
 * @param {string} props.projetId - Project ID
 * @param {Function} props.onTaskUpdate - Callback when task is updated
 * @param {Function} props.onTaskDelete - Callback when task is deleted
 * @param {boolean} props.canManage - Can user manage tasks
 */
export default function ProjetTasks({ taches = [], projetId, onTaskUpdate, onTaskDelete, canManage }) {
  const [showFormTache, setShowFormTache] = useState(false);
  const [editingTache, setEditingTache] = useState(null);

  const handleEditTache = (tache) => {
    setEditingTache(tache);
    setShowFormTache(true);
  };

  const handleCloseForm = () => {
    setShowFormTache(false);
    setEditingTache(null);
  };

  const handleTaskSaved = () => {
    handleCloseForm();
    if (onTaskUpdate) {
      onTaskUpdate();
    }
  };

  return (
    <div className="projet-tasks" style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>Tâches ({taches.length})</h2>
        {canManage && (
          <button
            onClick={() => setShowFormTache(true)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            + Nouvelle tâche
          </button>
        )}
      </div>

      {taches.length === 0 ? (
        <p style={{ color: "#6b7280", textAlign: "center", padding: "2rem" }}>
          Aucune tâche pour ce projet
        </p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {taches.map((tache) => (
            <div
              key={tache.id}
              style={{
                padding: "1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "#fff"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: "0.5rem" }}>{tache.titre}</h3>
                  {tache.description && (
                    <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                      {tache.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      backgroundColor: "#e5e7eb",
                      fontSize: "0.75rem"
                    }}>
                      {TACHE_STATUT_LABELS[tache.statut] || tache.statut}
                    </span>
                    <span style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      backgroundColor: PRIORITE_COLORS[tache.priorite] || "#e5e7eb",
                      color: "#fff",
                      fontSize: "0.75rem"
                    }}>
                      {TACHE_PRIORITE_LABELS[tache.priorite] || tache.priorite}
                    </span>
                    {tache.deadline && (
                      <span style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        backgroundColor: "#fef3c7",
                        fontSize: "0.75rem"
                      }}>
                        📅 {new Date(tache.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleEditTache(tache)}
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#e5e7eb",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.875rem"
                      }}
                    >
                      Modifier
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showFormTache && (
        <FormTache
          projetId={projetId}
          tache={editingTache}
          onClose={handleCloseForm}
          onSuccess={handleTaskSaved}
        />
      )}
    </div>
  );
}
