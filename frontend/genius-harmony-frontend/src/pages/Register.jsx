import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { useTheme } from "../context/ThemeContext";

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
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
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
        role: formData.role,
      });

      // Rediriger vers la page de connexion
      navigate("/login", {
        state: { message: "Inscription réussie ! Vous pouvez maintenant vous connecter." },
      });
    } catch (err) {
      console.error("Erreur inscription:", err);
      if (err.response?.data) {
        const errors = err.response.data;
        if (errors.username) {
          setError(`Nom d'utilisateur : ${errors.username[0]}`);
        } else if (errors.email) {
          setError(`Email : ${errors.email[0]}`);
        } else if (errors.password) {
          setError(`Mot de passe : ${errors.password[0]}`);
        } else {
          setError("Erreur lors de l'inscription. Veuillez réessayer.");
        }
      } else {
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
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: "absolute",
          top: "2rem",
          right: "2rem",
          background: "none",
          border: `1px solid ${theme.border.medium}`,
          borderRadius: "8px",
          padding: "0.5rem 0.75rem",
          cursor: "pointer",
          fontSize: "1.2rem",
          backgroundColor: theme.bg.secondary,
        }}
        title={isDark ? "Mode clair" : "Mode sombre"}
      >
        {isDark ? "☀️" : "🌙"}
      </button>

      <div
        style={{
          backgroundColor: theme.bg.secondary,
          padding: "3rem",
          borderRadius: "16px",
          boxShadow: theme.shadow.xl,
          width: "100%",
          maxWidth: "500px",
          border: `1px solid ${theme.border.light}`,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎭</div>
          <h1
            style={{
              margin: 0,
              color: theme.text.primary,
              fontSize: "2rem",
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
              Nom d'utilisateur *
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
              placeholder="votre-nom"
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
