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
    assigne_a: [],
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
        assigne_a: Array.isArray(tache.assigne_a) ? tache.assigne_a : (tache.assigne_a ? [tache.assigne_a] : []),
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
        assigne_a: [],
        deadline: "",
      });
    }
  }, [tache, projetId, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssigneToggle = (userId) => {
    setFormData((prev) => {
      const currentAssignees = prev.assigne_a || [];
      if (currentAssignees.includes(userId)) {
        // Retirer l'utilisateur
        return { ...prev, assigne_a: currentAssignees.filter(id => id !== userId) };
      } else {
        // Ajouter l'utilisateur
        return { ...prev, assigne_a: [...currentAssignees, userId] };
      }
    });
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
        assigne_a: Array.isArray(formData.assigne_a) && formData.assigne_a.length > 0 ? formData.assigne_a : [],
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
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#1a1a1a" }}>
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
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#1a1a1a" }}>
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
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#1a1a1a" }}>
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
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#1a1a1a" }}>
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
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#1a1a1a" }}>
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

        {/* Assigné à (sélection multiple) */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#1a1a1a" }}>
            Assigné à (plusieurs personnes possibles)
          </label>
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "0.5rem",
              backgroundColor: "#fff",
            }}
          >
            {users.length === 0 ? (
              <p style={{ margin: 0, color: "#999", fontSize: "0.9rem" }}>
                Aucun utilisateur disponible
              </p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    padding: "0.4rem",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    borderRadius: "4px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  onClick={() => handleAssigneToggle(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={formData.assigne_a.includes(user.id)}
                    onChange={() => handleAssigneToggle(user.id)}
                    style={{ marginRight: "0.5rem", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "0.95rem" }}>
                    {user.username} <span style={{ color: "#666" }}>({user.role})</span>
                  </span>
                </div>
              ))
            )}
          </div>
          {formData.assigne_a.length > 0 && (
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem", color: "#666" }}>
              {formData.assigne_a.length} personne{formData.assigne_a.length > 1 ? "s" : ""} sélectionnée{formData.assigne_a.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Deadline */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", color: "#1a1a1a" }}>
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
