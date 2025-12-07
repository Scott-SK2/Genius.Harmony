// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchPoles, createPole } from "../api/poles";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [poles, setPoles] = useState([]);
  const [newPole, setNewPole] = useState({ name: "", description: "" });

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

  async function handleSubmit(e) {
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

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard Admin – Genius.Harmony</h1>
      <p>
        Bienvenue, <strong>{user?.username}</strong> (rôle : {user?.role})
      </p>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Pôles de Genius.Harmony</h2>

      <ul>
        {poles.map((pole) => (
          <li key={pole.id}>
            <strong>{pole.name}</strong>
            {pole.description && <> – {pole.description}</>}
          </li>
        ))}
        {poles.length === 0 && <p>Aucun pôle pour l’instant.</p>}
      </ul>

      <h3>Ajouter un pôle</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
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
