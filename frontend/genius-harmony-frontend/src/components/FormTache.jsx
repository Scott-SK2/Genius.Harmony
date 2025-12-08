import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createTache, updateTache } from "../api/taches";
import { fetchProjets } from "../api/projets";
import { fetchUsers } from "../api/users";
import Modal from "./Modal";

const STATUT_OPTIONS = [
  { value: "a_faire", label: "À faire" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
];

const PRIORITE_OPTIONS = [
  { value: "basse", label: "Basse" },
  { value: "normale", label: "Normale" },
  { value: "haute", label: "Haute" },
  { value: "urgente", label: "Urgente" },
];

export default function FormTache({ isOpen, onClose, tache, projetId, onSuccess }) {
  const { token } = useAuth();
  const [projets, setProjets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projet: projetId || "",
    titre: "",
    description: "",
    statut: "a_faire",
    priorite: "normale",
    assigne_a: "",
    deadline: "",
  });

  // Charger les projets et utilisateurs
  useEffect(() => {
    if (!token || !isOpen) return;

    (async () => {
      try {
        const [projetsData, usersData] = await Promise.all([
          fetchProjets(token),
          fetchUsers(token),
        ]);
        setProjets(projetsData);
        setUsers(usersData);
      } catch (err) {
        console.error("Erreur fetch projets/users:", err);
      }
    })();
  }, [token, isOpen]);

  // Remplir le formulaire si édition
  useEffect(() => {
    if (tache) {
      setFormData({
        projet: tache.projet || projetId || "",
        titre: tache.titre || "",
        description: tache.description || "",
        statut: tache.statut || "a_faire",
        priorite: tache.priorite || "normale",
        assigne_a: tache.assigne_a || "",
        deadline: tache.deadline || "",
      });
    } else {
      // Reset pour création
      setFormData({
        projet: projetId || "",
        titre: "",
        description: "",
        statut: "a_faire",
        priorite: "normale",
        assigne_a: "",
        deadline: "",
      });
    }
  }, [tache, projetId, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titre.trim()) {
      alert("Le titre est obligatoire");
      return;
    }

    if (!formData.projet) {
      alert("Le projet est obligatoire");
      return;
    }

    setLoading(true);
    try {
      // Préparer les données
      const payload = {
        ...formData,
        assigne_a: formData.assigne_a || null,
        deadline: formData.deadline || null,
      };

      if (tache) {
        // Édition
        await updateTache(token, tache.id, payload);
      } else {
        // Création
        await createTache(token, payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur save tache:", err);
      alert("Impossible de sauvegarder la tâche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tache ? "Modifier la tâche" : "Nouvelle tâche"}>
      <form onSubmit={handleSubmit}>
        {/* Projet */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Projet *
          </label>
          <select
            name="projet"
            value={formData.projet}
            onChange={handleChange}
            required
            disabled={!!projetId}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: projetId ? "#f5f5f5" : "#fff",
            }}
          >
            <option value="">Sélectionner un projet</option>
            {projets.map((projet) => (
              <option key={projet.id} value={projet.id}>
                {projet.titre}
              </option>
            ))}
          </select>
        </div>

        {/* Titre */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Titre de la tâche *
          </label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Statut et Priorité */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Statut
            </label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              {STATUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Priorité
            </label>
            <select
              name="priorite"
              value={formData.priorite}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              {PRIORITE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assigné à */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Assigné à
          </label>
          <select
            name="assigne_a"
            value={formData.assigne_a}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Personne</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.role})
              </option>
            ))}
          </select>
        </div>

        {/* Deadline */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Deadline
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "0.6rem 1.5rem",
              backgroundColor: "#95a5a6",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.6rem 1.5rem",
              backgroundColor: "#27ae60",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Enregistrement..." : tache ? "Modifier" : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
