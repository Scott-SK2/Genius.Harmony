import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { uploadDocument } from "../api/documents";
import Modal from "./Modal";

const TYPE_OPTIONS = [
  { value: "scenario", label: "Scénario" },
  { value: "contrat", label: "Contrat" },
  { value: "budget", label: "Budget" },
  { value: "planning", label: "Planning" },
  { value: "media", label: "Media" },
  { value: "autre", label: "Autre" },
];

export default function UploadDocument({ isOpen, onClose, projetId, onSuccess }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    type: "autre",
    description: "",
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Auto-remplir le titre si vide
    if (!formData.titre && selectedFile) {
      setFormData((prev) => ({
        ...prev,
        titre: selectedFile.name.replace(/\.[^/.]+$/, ""), // Enlever l'extension
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titre.trim()) {
      alert("Le titre est obligatoire");
      return;
    }

    if (!file) {
      alert("Veuillez sélectionner un fichier");
      return;
    }

    if (!projetId) {
      alert("Projet manquant");
      return;
    }

    setLoading(true);
    try {
      // Créer FormData pour l'upload
      const data = new FormData();
      data.append("projet", projetId);
      data.append("titre", formData.titre);
      data.append("type", formData.type);
      data.append("description", formData.description);
      data.append("fichier", file);

      await uploadDocument(token, data);

      // Reset
      setFormData({ titre: "", type: "autre", description: "" });
      setFile(null);

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur upload document:", err);
      alert("Impossible d'uploader le document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Uploader un document">
      <form onSubmit={handleSubmit}>
        {/* Fichier */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Fichier *
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          {file && (
            <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#666" }}>
              Fichier sélectionné : <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>

        {/* Titre */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Titre *
          </label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            required
            placeholder="Nom du document"
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Type */}
        <div style={{ marginBottom: "1rem" }}>
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

        {/* Description */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Description optionnelle du document..."
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
            onClick={() => {
              setFormData({ titre: "", type: "autre", description: "" });
              setFile(null);
              onClose();
            }}
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
              backgroundColor: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Upload en cours..." : "Uploader"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
