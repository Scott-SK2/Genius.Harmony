import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationIcon from "./notifications/NotificationIcon";
import logo from "../assets/GH long.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <nav
        className="navbar-desktop"
        style={{
          backgroundColor: theme.bg.secondary,
          borderBottom: `1px solid ${theme.border.light}`,
          padding: "1rem clamp(1rem, 3vw, 2rem)",
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
            gap: "0.75rem",
          }}
        >
          <img
            src={logo}
            alt="Genius Harmony Logo"
            style={{
              height: "40px",
              objectFit: "contain"
            }}
          />
        </Link>

        {/* Hamburger button - visible sur mobile uniquement */}
        <button
          className="hamburger-menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            fontSize: "1.8rem",
            cursor: "pointer",
            color: theme.text.primary,
            padding: "0.5rem",
            minWidth: "44px",
            minHeight: "44px",
          }}
          aria-label="Menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Navigation principale - cachée sur mobile */}
        <div className="nav-links-desktop" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
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
            to="/taches/kanban"
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

          {/* Pôles - accessible aux admins, super admins, chefs de pôle et membres */}
          {["admin", "super_admin", "chef_pole", "membre"].includes(user.role) && (
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

        {/* User menu - caché sur mobile */}
        <div className="user-menu-desktop" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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

          {/* Notifications */}
          <NotificationIcon theme={theme} />

          {/* User info */}
          <Link
            to={`/users/${user.id}`}
            className="user-profile-link"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: theme.bg.tertiary,
              borderRadius: "8px",
              border: `1px solid ${theme.border.light}`,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.hover;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: theme.colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {user.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.username}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                "👤"
              )}
            </div>
            <div className="user-info-text">
              <div style={{ fontSize: "0.85rem", color: theme.text.secondary }}>
                {user.role}
              </div>
              <div style={{ fontWeight: "500", color: theme.text.primary }}>
                {user.username}
              </div>
            </div>
          </Link>

          {/* Logout button */}
          <button
            onClick={logout}
            className="logout-button"
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

      {/* Menu mobile dropdown */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-dropdown"
          style={{
            display: "none",
            position: "fixed",
            top: "73px",
            left: 0,
            right: 0,
            backgroundColor: theme.bg.secondary,
            borderBottom: `1px solid ${theme.border.light}`,
            boxShadow: theme.shadow.lg,
            zIndex: 99,
            maxHeight: "calc(100vh - 73px)",
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "1rem" }}>
            {/* Navigation links */}
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "block",
                padding: "1rem",
                color: theme.text.primary,
                textDecoration: "none",
                fontWeight: "500",
                borderRadius: "8px",
                marginBottom: "0.5rem",
                backgroundColor: theme.bg.tertiary,
              }}
            >
              🏠 Dashboard
            </Link>

            <Link
              to="/projets"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "block",
                padding: "1rem",
                color: theme.text.primary,
                textDecoration: "none",
                fontWeight: "500",
                borderRadius: "8px",
                marginBottom: "0.5rem",
                backgroundColor: theme.bg.tertiary,
              }}
            >
              📁 Projets
            </Link>

            <Link
              to="/taches/kanban"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "block",
                padding: "1rem",
                color: theme.text.primary,
                textDecoration: "none",
                fontWeight: "500",
                borderRadius: "8px",
                marginBottom: "0.5rem",
                backgroundColor: theme.bg.tertiary,
              }}
            >
              📊 Kanban
            </Link>

            {!["stagiaire", "collaborateur", "partenaire", "client"].includes(user.role) && (
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "1rem",
                  color: theme.text.primary,
                  textDecoration: "none",
                  fontWeight: "500",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                  backgroundColor: theme.bg.tertiary,
                }}
              >
                👥 Utilisateurs
              </Link>
            )}

            {["admin", "super_admin", "chef_pole", "membre"].includes(user.role) && (
              <Link
                to="/admin/poles"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "1rem",
                  color: theme.text.primary,
                  textDecoration: "none",
                  fontWeight: "500",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                  backgroundColor: theme.bg.tertiary,
                }}
              >
                🎯 Pôles
              </Link>
            )}

            <hr style={{ border: "none", borderTop: `1px solid ${theme.border.light}`, margin: "1rem 0" }} />

            {/* User info mobile */}
            <Link
              to={`/users/${user.id}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                backgroundColor: theme.bg.tertiary,
                borderRadius: "8px",
                textDecoration: "none",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: theme.colors.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {user.photo_url ? (
                  <img
                    src={user.photo_url}
                    alt={user.username}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  "👤"
                )}
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", color: theme.text.secondary }}>
                  {user.role}
                </div>
                <div style={{ fontWeight: "600", color: theme.text.primary, fontSize: "1.1rem" }}>
                  {user.username}
                </div>
              </div>
            </Link>

            {/* Theme toggle mobile */}
            <button
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
              style={{
                width: "100%",
                padding: "1rem",
                backgroundColor: theme.bg.tertiary,
                border: `1px solid ${theme.border.medium}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
                color: theme.text.primary,
                marginBottom: "0.5rem",
              }}
            >
              {isDark ? "☀️ Mode clair" : "🌙 Mode sombre"}
            </button>

            {/* Logout mobile */}
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              style={{
                width: "100%",
                padding: "1rem",
                backgroundColor: theme.colors.danger,
                color: theme.text.inverse,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </>
  );
}
