import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { useTheme } from "../context/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";
import logo from "../assets/GH long.png";

const ROLE_OPTIONS = [
  { value: "membre", label: "Membre", description: "Membre de l'équipe" },
  { value: "stagiaire", label: "Stagiaire", description: "Stagiaire ou apprenti" },
  { value: "collaborateur", label: "Collaborateur", description: "Collaborateur externe" },
  { value: "artiste", label: "Artiste", description: "Artiste collaborateur" },
  { value: "client", label: "Client", description: "Client" },
  { value: "partenaire", label: "Partenaire", description: "Partenaire externe" },
];

export default function Register() {
  const navigate = useNavigate();
  const { theme, isDark, toggleTheme } = useTheme();
  const { isMobile } = useResponsive();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    role: "membre",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password2) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
      });

      // Rediriger vers la page de connexion
      navigate("/login", {
        state: { message: "Inscription réussie ! Vous pouvez maintenant vous connecter." },
      });
    } catch (err) {
      console.error("Erreur inscription complète:", err);
      console.error("Réponse serveur:", err.response);

      if (err.response?.data) {
        const errors = err.response.data;

        // Erreurs de validation spécifiques
        if (errors.username) {
          setError(`Nom d'utilisateur : ${errors.username[0]}`);
        } else if (errors.email) {
          setError(`Email : ${errors.email[0]}`);
        } else if (errors.password) {
          setError(`Mot de passe : ${errors.password[0]}`);
        } else if (errors.first_name) {
          setError(`Prénom : ${errors.first_name[0]}`);
        } else if (errors.last_name) {
          setError(`Nom : ${errors.last_name[0]}`);
        } else if (errors.detail) {
          // Message d'erreur générique du serveur
          setError(`Erreur serveur : ${errors.detail}`);
        } else if (errors.error) {
          setError(`Erreur : ${errors.error}`);
        } else {
          // Afficher l'objet d'erreur complet si format inconnu
          setError(`Erreur serveur (${err.response.status}) : ${JSON.stringify(errors)}`);
        }
      } else if (err.response?.status) {
        // Erreur HTTP sans détails
        if (err.response.status === 500) {
          setError("Erreur interne du serveur. L'équipe technique a été notifiée. Veuillez réessayer dans quelques instants.");
        } else if (err.response.status === 503) {
          setError("Service temporairement indisponible. Veuillez réessayer dans quelques instants.");
        } else {
          setError(`Erreur serveur (code ${err.response.status}). Veuillez réessayer.`);
        }
      } else if (err.request) {
        // Requête envoyée mais pas de réponse
        setError("Impossible de contacter le serveur. Vérifiez votre connexion internet.");
      } else {
        // Erreur lors de la configuration de la requête
        setError("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.bg.primary,
        padding: "2rem",
        position: "relative",
      }}
    >
      {/* Theme toggle - Responsive */}
      <button
        onClick={toggleTheme}
        style={{
          position: "absolute",
          top: isMobile ? "1rem" : "2rem",
          right: isMobile ? "1rem" : "2rem",
          background: "none",
          border: `1px solid ${theme.border.medium}`,
          borderRadius: "8px",
          padding: isMobile ? "0.4rem 0.6rem" : "0.5rem 0.75rem",
          cursor: "pointer",
          fontSize: isMobile ? "1rem" : "1.2rem",
          backgroundColor: theme.bg.secondary,
        }}
        title={isDark ? "Mode clair" : "Mode sombre"}
      >
        {isDark ? "☀️" : "🌙"}
      </button>

      <div
        style={{
          backgroundColor: theme.bg.secondary,
          padding: isMobile ? "2rem 1.5rem" : "3rem",
          borderRadius: "16px",
          boxShadow: theme.shadow.xl,
          width: "100%",
          maxWidth: "500px",
          border: `1px solid ${theme.border.light}`,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? "1.5rem" : "2rem" }}>
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
            <img
              src={logo}
              alt="Genius Harmony Logo"
              style={{
                height: isMobile ? "60px" : "80px",
                objectFit: "contain"
              }}
            />
          </div>
          <h1
            style={{
              margin: 0,
              color: theme.text.primary,
              fontSize: isMobile ? "1.5rem" : "2rem",
              marginBottom: "0.5rem",
            }}
          >
            Genius.Harmony
          </h1>
          <p style={{ margin: 0, color: theme.text.secondary }}>
            Créer votre compte
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: `${theme.colors.danger}20`,
              border: `1px solid ${theme.colors.danger}`,
              borderRadius: "8px",
              marginBottom: "1.5rem",
              color: theme.colors.danger,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: theme.text.primary,
              }}
            >
              Nom d'utilisateur (Pseudo) *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${theme.border.medium}`,
                fontSize: "1rem",
                backgroundColor: theme.bg.tertiary,
                color: theme.text.primary,
              }}
              placeholder="votre-pseudo"
            />
          </div>

          {/* Prénom */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: theme.text.primary,
              }}
            >
              Prénom *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${theme.border.medium}`,
                fontSize: "1rem",
                backgroundColor: theme.bg.tertiary,
                color: theme.text.primary,
              }}
              placeholder="Jean"
            />
          </div>

          {/* Nom */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: theme.text.primary,
              }}
            >
              Nom *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${theme.border.medium}`,
                fontSize: "1rem",
                backgroundColor: theme.bg.tertiary,
                color: theme.text.primary,
              }}
              placeholder="Dupont"
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: theme.text.primary,
              }}
            >
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${theme.border.medium}`,
                fontSize: "1rem",
                backgroundColor: theme.bg.tertiary,
                color: theme.text.primary,
              }}
              placeholder="vous@exemple.com"
            />
          </div>

          {/* Role */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: theme.text.primary,
              }}
            >
              Rôle *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${theme.border.medium}`,
                fontSize: "1rem",
                backgroundColor: theme.bg.tertiary,
                color: theme.text.primary,
              }}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
            <div
              style={{
                fontSize: "0.85rem",
                color: theme.text.secondary,
                marginTop: "0.5rem",
              }}
            >
              Le rôle "Administrateur" est attribué uniquement par un admin existant.
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: theme.text.primary,
              }}
            >
              Mot de passe *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${theme.border.medium}`,
                fontSize: "1rem",
                backgroundColor: theme.bg.tertiary,
                color: theme.text.primary,
              }}
              placeholder="••••••••"
            />
          </div>

          {/* Password confirmation */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: theme.text.primary,
              }}
            >
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: `1px solid ${theme.border.medium}`,
                fontSize: "1rem",
                backgroundColor: theme.bg.tertiary,
                color: theme.text.primary,
              }}
              placeholder="••••••••"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.875rem",
              backgroundColor: theme.colors.primary,
              color: theme.text.inverse,
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = theme.shadow.md;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>

        {/* Login link */}
        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: theme.text.secondary,
          }}
        >
          Vous avez déjà un compte ?{" "}
          <Link
            to="/login"
            style={{
              color: theme.colors.primary,
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
