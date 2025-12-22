import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SPECIALITE_OPTIONS = [
  { value: "", label: "Non spécifié" },
  { value: "musicien", label: "Musicien" },
  { value: "manager", label: "Manager" },
  { value: "model", label: "Modèle" },
  { value: "photographe", label: "Photographe" },
  { value: "videaste", label: "Vidéaste" },
  { value: "graphiste", label: "Graphiste" },
  { value: "developpeur", label: "Développeur" },
  { value: "commercial", label: "Commercial" },
  { value: "assistant", label: "Assistant" },
  { value: "autre", label: "Autre" },
];

export default function EditProfile() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    description: "",
    membre_specialite: "",
  });

  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
  const canEdit = user && (user.id === parseInt(id) || isAdmin);

  useEffect(() => {
    if (!canEdit) {
      setError("Vous n'avez pas la permission de modifier ce profil");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/users/${id}/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Impossible de charger le profil");
        }

        const data = await response.json();
        setFormData({
          description: data.description || "",
          membre_specialite: data.membre_specialite || "",
        });
      } catch (err) {
        console.error("Erreur fetch profil:", err);
        setError("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, id, canEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`http://127.0.0.1:8000/api/users/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Impossible de mettre à jour le profil");
      }

      // Rediriger vers la page de profil
      navigate(`/users/${id}`);
    } catch (err) {
      console.error("Erreur sauvegarde profil:", err);
      setError(err.message);
    } finally {
      setSaving(false);
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
          <div style={{ color: "#c4b5fd" }}>Chargement...</div>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div>
        <div
          style={{
            padding: "2rem",
            backgroundColor: "rgba(248, 113, 113, 0.1)",
            border: "1px solid #f87171",
            borderRadius: "12px",
            color: "#f87171",
            marginBottom: "1.5rem",
          }}
        >
          <strong>Erreur :</strong> {error}
        </div>
        <Link
          to={`/users/${id}`}
          style={{
            color: "#7c3aed",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
          }}
        >
          ← Retour au profil
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      {/* Navigation */}
      <div style={{ marginBottom: "2rem" }}>
        <Link
          to={`/users/${id}`}
          style={{
            color: "#7c3aed",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "600",
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = "none";
          }}
        >
          ← Retour au profil
        </Link>
      </div>

      {/* Titre */}
      <h1 style={{ margin: 0, marginBottom: "2rem", color: "#fff", fontSize: "2rem" }}>
        ✏️ Modifier le profil
      </h1>

      {/* Erreur */}
      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "rgba(248, 113, 113, 0.1)",
            border: "1px solid #f87171",
            borderRadius: "8px",
            color: "#f87171",
            marginBottom: "1.5rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            backgroundColor: "#2d1b69",
            padding: "2rem",
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(124, 58, 237, 0.3)",
            border: "1px solid #4c1d95",
          }}
        >
          {/* Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="description"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#c4b5fd",
                fontWeight: "500",
              }}
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="5"
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#1a0f3d",
                border: "1px solid #4c1d95",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "1rem",
                fontFamily: "inherit",
                resize: "vertical",
              }}
              placeholder="Décrivez-vous en quelques mots..."
            />
            <div style={{ fontSize: "0.85rem", color: "#a78bfa", marginTop: "0.5rem" }}>
              Cette description sera visible sur votre profil public
            </div>
          </div>

          {/* Spécialité - seulement si admin/super_admin */}
          {isAdmin && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor="specialite"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#c4b5fd",
                  fontWeight: "500",
                }}
              >
                Spécialité (membre/chef de pôle)
              </label>
              <select
                id="specialite"
                value={formData.membre_specialite}
                onChange={(e) => setFormData({ ...formData, membre_specialite: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#1a0f3d",
                  border: "1px solid #4c1d95",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "1rem",
                }}
              >
                {SPECIALITE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: "0.85rem", color: "#f59e0b", marginTop: "0.5rem" }}>
                🔒 Seuls les administrateurs peuvent modifier ce champ
              </div>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: "0.75rem 1.5rem",
                backgroundColor: saving ? "#6d32d1" : "#7c3aed",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = "#6d28d9";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = "#7c3aed";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              {saving ? "Enregistrement..." : "💾 Enregistrer"}
            </button>
            <Link
              to={`/users/${id}`}
              style={{
                flex: 1,
                padding: "0.75rem 1.5rem",
                backgroundColor: "#4c1d95",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#5b21b6";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#4c1d95";
              }}
            >
              Annuler
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
