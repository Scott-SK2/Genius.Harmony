// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchPoles, createPole, updatePole, deletePole } from "../api/poles";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [poles, setPoles] = useState([]);
  const [newPole, setNewPole] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({ name: "", description: "" });

  // Charger les pôles au chargement
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const data = await fetchPoles(token);
        setPoles(data);
      } catch (err) {
        console.error("Erreur fetch poles:", err);
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
      setPoles((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );
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

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard Admin – Genius.Harmony</h1>
      <p>
        Bienvenue, <strong>{user?.username}</strong> (rôle : {user?.role})
      </p>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Pôles de Genius.Harmony</h2>

      {poles.length === 0 ? (
        <p>Aucun pôle pour l’instant.</p>
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
              }}
            >
              {editingId === pole.id ? (
                <>
                  <input
                    type="text"
                    value={editingData.name}
                    onChange={(e) =>
                      setEditingData((d) => ({ ...d, name: e.target.value }))
                    }
                    style={{ padding: "0.4rem" }}
                  />
                  <textarea
                    value={editingData.description}
                    onChange={(e) =>
                      setEditingData((d) => ({
                        ...d,
                        description: e.target.value,
                      }))
                    }
                    style={{ padding: "0.4rem" }}
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" onClick={() => saveEdit(pole.id)}>
                      Sauvegarder
                    </button>
                    <button type="button" onClick={cancelEdit}>
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong>{pole.name}</strong>
                    {pole.description && (
                      <span> – {pole.description}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="button" onClick={() => startEdit(pole)}>
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(pole.id)}
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
      <form onSubmit={handleCreate} style={{ maxWidth: "400px" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <input
            type="text"
            placeholder="Nom du pôle (ex: Cinéma)"
            value={newPole.name}
            onChange={(e) =>
              setNewPole((p) => ({ ...p, name: e.target.value }))
            }
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <div style={{ marginBottom: "0.5rem" }}>
          <textarea
            placeholder="Description (optionnelle)"
            value={newPole.description}
            onChange={(e) =>
              setNewPole((p) => ({ ...p, description: e.target.value }))
            }
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
        <button type="submit">Créer le pôle</button>
      </form>
    </div>
  );
}
