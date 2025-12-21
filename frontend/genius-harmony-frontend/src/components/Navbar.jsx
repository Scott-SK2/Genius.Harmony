import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  if (!user) return null;

  return (
    <nav
      style={{
        backgroundColor: theme.bg.secondary,
        borderBottom: `1px solid ${theme.border.light}`,
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: theme.shadow.sm,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link
        to="/dashboard"
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          textDecoration: "none",
          color: theme.colors.primary,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span>🎭</span>
        <span>Genius.Harmony</span>
      </Link>

      {/* Navigation principale */}
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        <Link
          to="/dashboard"
          style={{
            color: theme.text.primary,
            textDecoration: "none",
            fontWeight: "500",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = theme.colors.primary)}
          onMouseLeave={(e) => (e.target.style.color = theme.text.primary)}
        >
          🏠 Dashboard
        </Link>

        <Link
          to="/projets"
          style={{
            color: theme.text.primary,
            textDecoration: "none",
            fontWeight: "500",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = theme.colors.primary)}
          onMouseLeave={(e) => (e.target.style.color = theme.text.primary)}
        >
          📁 Projets
        </Link>

        <Link
          to="/kanban"
          style={{
            color: theme.text.primary,
            textDecoration: "none",
            fontWeight: "500",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = theme.colors.primary)}
          onMouseLeave={(e) => (e.target.style.color = theme.text.primary)}
        >
          📊 Kanban
        </Link>

        {/* Utilisateurs - accessible à tous sauf stagiaire, collaborateur, partenaire et client */}
        {!["stagiaire", "collaborateur", "partenaire", "client"].includes(user.role) && (
          <Link
            to="/admin/users"
            style={{
              color: theme.text.primary,
              textDecoration: "none",
              fontWeight: "500",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = theme.colors.primary)}
            onMouseLeave={(e) => (e.target.style.color = theme.text.primary)}
          >
            👥 Utilisateurs
          </Link>
        )}

        {/* Pôles - uniquement pour admin et super_admin */}
        {(user.role === "admin" || user.role === "super_admin") && (
          <Link
            to="/admin/poles"
            style={{
              color: theme.text.primary,
              textDecoration: "none",
              fontWeight: "500",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = theme.colors.primary)}
            onMouseLeave={(e) => (e.target.style.color = theme.text.primary)}
          >
            🎯 Pôles
          </Link>
        )}
      </div>

      {/* User menu */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: "none",
            border: `1px solid ${theme.border.medium}`,
            borderRadius: "8px",
            padding: "0.5rem 0.75rem",
            cursor: "pointer",
            fontSize: "1.2rem",
            transition: "all 0.2s",
            backgroundColor: theme.bg.tertiary,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = theme.bg.hover;
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = theme.bg.tertiary;
            e.target.style.transform = "scale(1)";
          }}
          title={isDark ? "Mode clair" : "Mode sombre"}
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        {/* User info */}
        <div
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: theme.bg.tertiary,
            borderRadius: "8px",
            border: `1px solid ${theme.border.light}`,
          }}
        >
          <div style={{ fontSize: "0.85rem", color: theme.text.secondary }}>
            {user.role}
          </div>
          <div style={{ fontWeight: "500", color: theme.text.primary }}>
            {user.username}
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: theme.colors.danger,
            color: theme.text.inverse,
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = theme.shadow.md;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
