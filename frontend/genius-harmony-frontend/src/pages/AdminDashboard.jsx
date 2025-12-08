// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchPoles, createPole, updatePole, deletePole } from "../api/poles";
import { fetchProjets } from "../api/projets";
import { fetchTaches } from "../api/taches";
import { fetchUsers } from "../api/users";

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
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
    return <div style={{ padding: "2rem" }}>Chargement du dashboard...</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px" }}>
      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: "0.5rem" }}>Dashboard Admin</h1>
          <p style={{ margin: 0, color: "#666" }}>
            Bienvenue, <strong>{user?.username}</strong>
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Déconnexion
        </button>
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
          to="/admin/users"
          style={{
            padding: "1rem",
            backgroundColor: "#3498db",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          👥 Gérer les utilisateurs
        </Link>
        <Link
          to="/projets"
          style={{
            padding: "1rem",
            backgroundColor: "#9b59b6",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          📁 Voir les projets
        </Link>
        <Link
          to="/kanban"
          style={{
            padding: "1rem",
            backgroundColor: "#1abc9c",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          📊 Kanban des tâches
        </Link>
      </div>

      {/* Statistiques */}
      <h2>Statistiques globales</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#3498db",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.totalProjets}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Projets total</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>
            {stats.projetsEnCours} en cours
          </div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#1abc9c",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.totalTaches}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Tâches total</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>
            {stats.tachesAFaire} à faire, {stats.tachesEnCours} en cours
          </div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#f39c12",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{stats.totalUtilisateurs}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Utilisateurs</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>
            Membres de l'équipe
          </div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#9b59b6",
            color: "#fff",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{poles.length}</div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>Pôles actifs</div>
          <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.5rem" }}>
            Départements organisés
          </div>
        </div>
      </div>

      <hr style={{ margin: "2rem 0", border: "none", borderTop: "1px solid #e0e0e0" }} />

      {/* Gestion des pôles */}
      <h2>Gestion des Pôles</h2>

      {poles.length === 0 ? (
        <p style={{ color: "#666" }}>Aucun pôle pour l'instant.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {poles.map((pole) => (
            <li
              key={pole.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                marginBottom: "0.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                backgroundColor: "#f8f9fa",
              }}
            >
              {editingId === pole.id ? (
                <>
                  <input
                    type="text"
                    value={editingData.name}
                    onChange={(e) => setEditingData((d) => ({ ...d, name: e.target.value }))}
                    style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                  <textarea
                    value={editingData.description}
                    onChange={(e) =>
                      setEditingData((d) => ({
                        ...d,
                        description: e.target.value,
                      }))
                    }
                    style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => saveEdit(pole.id)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#27ae60",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Sauvegarder
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#95a5a6",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong style={{ fontSize: "1.1rem" }}>{pole.name}</strong>
                    {pole.description && (
                      <div style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                        {pole.description}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => startEdit(pole)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        backgroundColor: "#3498db",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(pole.id)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        backgroundColor: "#e74c3c",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: "2rem" }}>Ajouter un pôle</h3>
      <form onSubmit={handleCreate} style={{ maxWidth: "500px" }}>
        <div style={{ marginBottom: "0.75rem" }}>
          <input
            type="text"
            placeholder="Nom du pôle (ex: Cinéma)"
            value={newPole.name}
            onChange={(e) => setNewPole((p) => ({ ...p, name: e.target.value }))}
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: "0.75rem" }}>
          <textarea
            placeholder="Description (optionnelle)"
            value={newPole.description}
            onChange={(e) => setNewPole((p) => ({ ...p, description: e.target.value }))}
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              minHeight: "80px",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "0.6rem 1.5rem",
            backgroundColor: "#27ae60",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Créer le pôle
        </button>
      </form>
    </div>
  );
}
