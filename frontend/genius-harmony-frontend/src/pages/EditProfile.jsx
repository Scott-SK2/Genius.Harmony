import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";
import { API_BASE_URL } from "../config";

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
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    description: "",
    membre_specialite: "",
    phone: "",
    website: "",
    instagram: "",
    twitter: "",
    tiktok: "",
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
        const response = await fetch(`${API_BASE_URL}/api/users/${id}/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Impossible de charger le profil");
        }

        const data = await response.json();
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          description: data.description || "",
          membre_specialite: data.membre_specialite || "",
          phone: data.phone || "",
          website: data.website || "",
          instagram: data.instagram || "",
          twitter: data.twitter || "",
          tiktok: data.tiktok || "",
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

      const response = await fetch(`${API_BASE_URL}/api/users/${id}/`, {
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
          <div style={{ color: theme.text.secondary }}>Chargement...</div>
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
            border: `1px solid ${theme.colors.danger}`,
            borderRadius: "12px",
            color: theme.colors.danger,
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
            color: theme.colors.primary,
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
      <h1 style={{ margin: 0, marginBottom: isMobile ? "1.5rem" : "2rem", color: theme.text.primary, fontSize: isMobile ? "1.5rem" : "2rem" }}>
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
            color: theme.colors.danger,
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
            backgroundColor: theme.bg.tertiary,
            padding: isMobile ? "1.25rem" : "2rem",
            borderRadius: isMobile ? "12px" : "16px",
            boxShadow: theme.shadow.lg,
            border: `1px solid ${theme.border.light}`,
          }}
        >
          {/* Section Informations personnelles */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, marginBottom: "1rem", color: theme.text.primary, fontSize: "1.25rem" }}>
              👤 Informations personnelles
            </h3>

            {/* Prénom */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="first_name"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: theme.colors.secondary,
                  fontWeight: "600",
                }}
              >
                Prénom
              </label>
              <input
                type="text"
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: theme.bg.secondary,
                  border: `1px solid ${theme.border.medium}`,
                  borderRadius: "8px",
                  color: theme.text.primary,
                  fontSize: "1rem",
                }}
                placeholder="Jean"
              />
            </div>

            {/* Nom */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="last_name"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: theme.colors.secondary,
                  fontWeight: "600",
                }}
              >
                Nom
              </label>
              <input
                type="text"
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: theme.bg.secondary,
                  border: `1px solid ${theme.border.medium}`,
                  borderRadius: "8px",
                  color: theme.text.primary,
                  fontSize: "1rem",
                }}
                placeholder="Dupont"
              />
            </div>

            <div style={{ fontSize: "0.85rem", color: theme.text.tertiary, marginTop: "0.5rem" }}>
              Votre prénom et nom ne seront visibles que dans votre profil
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="description"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: theme.colors.secondary,
                fontWeight: "600",
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
                backgroundColor: theme.bg.secondary,
                border: `1px solid ${theme.border.medium}`,
                borderRadius: "8px",
                color: theme.text.primary,
                fontSize: "1rem",
                fontFamily: "inherit",
                resize: "vertical",
              }}
              placeholder="Décrivez-vous en quelques mots..."
            />
            <div style={{ fontSize: "0.85rem", color: theme.text.tertiary, marginTop: "0.5rem" }}>
              Cette description sera visible sur votre profil public
            </div>
          </div>

          {/* Section Informations de contact */}
          <div style={{ marginBottom: "1.5rem", paddingTop: "1.5rem", borderTop: `1px solid ${theme.border.light}` }}>
            <h3 style={{ margin: 0, marginBottom: "1rem", color: theme.text.primary, fontSize: "1.25rem" }}>
              📞 Informations de contact
            </h3>

            {/* Téléphone */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="phone"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: theme.colors.secondary,
                  fontWeight: "600",
                }}
              >
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: theme.bg.secondary,
                  border: `1px solid ${theme.border.medium}`,
                  borderRadius: "8px",
                  color: theme.text.primary,
                  fontSize: "1rem",
                }}
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            {/* Website */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="website"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: theme.colors.secondary,
                  fontWeight: "600",
                }}
              >
                Site web
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: theme.bg.secondary,
                  border: `1px solid ${theme.border.medium}`,
                  borderRadius: "8px",
                  color: theme.text.primary,
                  fontSize: "1rem",
                }}
                placeholder="https://votre-site.com"
              />
            </div>

            {/* Instagram */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="instagram"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: theme.colors.secondary,
                  fontWeight: "600",
                }}
              >
                Instagram
              </label>
              <input
                type="url"
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: theme.bg.secondary,
                  border: `1px solid ${theme.border.medium}`,
                  borderRadius: "8px",
                  color: theme.text.primary,
                  fontSize: "1rem",
                }}
                placeholder="https://instagram.com/votre-username"
              />
            </div>

            {/* Twitter */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="twitter"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: theme.colors.secondary,
                  fontWeight: "600",
                }}
              >
                Twitter / X
              </label>
              <input
                type="url"
                id="twitter"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: theme.bg.secondary,
                  border: `1px solid ${theme.border.medium}`,
                  borderRadius: "8px",
                  color: theme.text.primary,
                  fontSize: "1rem",
                }}
                placeholder="https://twitter.com/votre-username"
              />
            </div>

            {/* TikTok */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor="tiktok"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: theme.colors.secondary,
                  fontWeight: "600",
                }}
              >
                TikTok
              </label>
              <input
                type="url"
                id="tiktok"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: theme.bg.secondary,
                  border: `1px solid ${theme.border.medium}`,
                  borderRadius: "8px",
                  color: theme.text.primary,
                  fontSize: "1rem",
                }}
                placeholder="https://tiktok.com/@votre-username"
              />
            </div>

            <div style={{ fontSize: "0.85rem", color: theme.text.tertiary, marginTop: "0.5rem" }}>
              Ces informations seront visibles sur votre profil public
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
              <div style={{ fontSize: "0.85rem", color: theme.colors.warning, marginTop: "0.5rem" }}>
                🔒 Seuls les administrateurs peuvent modifier ce champ
              </div>
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "1rem", marginTop: isMobile ? "1.5rem" : "2rem" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: isMobile ? "0.75rem 1rem" : "0.75rem 1.5rem",
                backgroundColor: saving ? theme.colors.accent : theme.colors.secondary,
                color: theme.text.inverse,
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = theme.colors.orangeLight;
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = theme.shadow.md;
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = theme.colors.secondary;
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
                padding: isMobile ? "0.75rem 1rem" : "0.75rem 1.5rem",
                backgroundColor: theme.bg.tertiary,
                color: theme.text.primary,
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
                e.target.style.backgroundColor = theme.bg.hover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.bg.tertiary;
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
