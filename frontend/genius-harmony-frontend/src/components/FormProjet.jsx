import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createProjet, updateProjet } from "../api/projets";
import { fetchPoles } from "../api/poles";
import { fetchUsers } from "../api/users";
import Modal from "./Modal";

const TYPE_OPTIONS = [
  { value: "film", label: "Film" },
  { value: "court_metrage", label: "Court métrage" },
  { value: "web_serie", label: "Web série" },
  { value: "event", label: "Event" },
  { value: "atelier_animation", label: "Atelier/Animation" },
  { value: "musique", label: "Musique" },
  { value: "autre", label: "Autre" },
];

const STATUT_OPTIONS = [
  { value: "brouillon", label: "Brouillon" },
  { value: "en_attente", label: "En attente" },
  { value: "en_cours", label: "En cours" },
  { value: "en_revision", label: "En révision" },
  { value: "termine", label: "Terminé" },
  { value: "annule", label: "Annulé" },
];

export default function FormProjet({ isOpen, onClose, projet, onSuccess }) {
  const { token } = useAuth();
  const [poles, setPoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    type: "film",
    statut: "brouillon",
    description: "",
    pole: "",
    client: "",
    chef_projet: "",
    date_debut: "",
    date_fin_prevue: "",
  });

  // Charger les pôles et utilisateurs
  useEffect(() => {
    if (!token || !isOpen) return;

    (async () => {
      try {
        const [polesData, usersData] = await Promise.all([
          fetchPoles(token),
          fetchUsers(token),
        ]);
        setPoles(polesData);
        setUsers(usersData);
      } catch (err) {
        console.error("Erreur fetch poles/users:", err);
      }
    })();
  }, [token, isOpen]);

  // Remplir le formulaire si édition
  useEffect(() => {
    if (projet) {
      setFormData({
        titre: projet.titre || "",
        type: projet.type || "film",
        statut: projet.statut || "brouillon",
        description: projet.description || "",
        pole: projet.pole || "",
        client: projet.client || "",
        chef_projet: projet.chef_projet || "",
        date_debut: projet.date_debut || "",
        date_fin_prevue: projet.date_fin_prevue || "",
      });
    } else {
      // Reset pour création
      setFormData({
        titre: "",
        type: "film",
        statut: "brouillon",
        description: "",
        pole: "",
        client: "",
        chef_projet: "",
        date_debut: "",
        date_fin_prevue: "",
      });
    }
  }, [projet, isOpen]);

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

    setLoading(true);
    try {
      // Préparer les données (convertir les chaînes vides en null)
      const payload = {
        ...formData,
        pole: formData.pole || null,
        client: formData.client || null,
        chef_projet: formData.chef_projet || null,
        date_debut: formData.date_debut || null,
        date_fin_prevue: formData.date_fin_prevue || null,
      };

      if (projet) {
        // Édition
        await updateProjet(token, projet.id, payload);
      } else {
        // Création
        await createProjet(token, payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur save projet:", err);
      alert("Impossible de sauvegarder le projet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={projet ? "Modifier le projet" : "Nouveau projet"}>
      <form onSubmit={handleSubmit}>
        {/* Titre */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Titre du projet *
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

        {/* Type et Statut */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

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
            rows={4}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Pôle */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Pôle
          </label>
          <select
            name="pole"
            value={formData.pole}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">Aucun</option>
            {poles.map((pole) => (
              <option key={pole.id} value={pole.id}>
                {pole.name}
              </option>
            ))}
          </select>
        </div>

        {/* Client et Chef de projet */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Client
            </label>
            <select
              name="client"
              value={formData.client}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">Aucun</option>
              {users
                .filter((u) => u.role === "client" || u.role === "partenaire")
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Chef de projet
            </label>
            <select
              name="chef_projet"
              value={formData.chef_projet}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">Aucun</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Date de début
            </label>
            <input
              type="date"
              name="date_debut"
              value={formData.date_debut}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Date de fin prévue
            </label>
            <input
              type="date"
              name="date_fin_prevue"
              value={formData.date_fin_prevue}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
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
            {loading ? "Enregistrement..." : projet ? "Modifier" : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
