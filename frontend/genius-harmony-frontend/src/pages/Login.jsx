import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/GH long.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDark, toggleTheme } = useTheme();

  // Message de succès depuis la page d'inscription
  const successMessage = location.state?.message;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(username, password);

      // Redirection selon le rôle
      if (user.role === "admin" || user.role === "super_admin") navigate("/admin/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      console.error("Erreur login:", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  }

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
          maxWidth: "450px",
          border: `1px solid ${theme.border.light}`,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
            <img
              src={logo}
              alt="Genius Harmony Logo"
              style={{
                height: "80px",
                objectFit: "contain"
              }}
            />
          </div>
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
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Success message */}
        {successMessage && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: `${theme.colors.success}20`,
              border: `1px solid ${theme.colors.success}`,
              borderRadius: "8px",
              marginBottom: "1.5rem",
              color: theme.colors.success,
            }}
          >
            {successMessage}
          </div>
        )}

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
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              placeholder="Entrez votre nom d'utilisateur"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: theme.text.primary,
              }}
            >
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              placeholder="Entrez votre mot de passe"
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
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Register link */}
        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: theme.text.secondary,
          }}
        >
          Vous n'avez pas de compte ?{" "}
          <Link
            to="/register"
            style={{
              color: theme.colors.primary,
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
