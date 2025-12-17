import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarStyle = {
    width: "250px",
    backgroundColor: "#1a1a1a",
    minHeight: "100vh",
    padding: "2rem 0",
    position: "fixed",
    left: 0,
    top: 0,
    display: "flex",
    flexDirection: "column",
  };

  const menuItemStyle = (isActive) => ({
    padding: "0.875rem 2rem",
    color: isActive ? "#fff" : "#999",
    backgroundColor: isActive ? "#c0392b" : "transparent",
    textDecoration: "none",
    display: "block",
    transition: "all 0.2s",
    cursor: "pointer",
    borderLeft: isActive ? "4px solid #e74c3c" : "4px solid transparent",
  });

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: "flex", backgroundColor: "#0f0f0f", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={{ padding: "0 2rem", marginBottom: "3rem" }}>
          <h2 style={{ color: "#fff", margin: 0, fontSize: "1.5rem" }}>🎭 Genius</h2>
        </div>

        <nav style={{ flex: 1 }}>
          <Link
            to="/dashboard"
            style={menuItemStyle(isActive("/dashboard"))}
            onMouseEnter={(e) => !isActive("/dashboard") && (e.target.style.backgroundColor = "#222")}
            onMouseLeave={(e) => !isActive("/dashboard") && (e.target.style.backgroundColor = "transparent")}
          >
            Dashboard
          </Link>
          <Link
            to="/projets"
            style={menuItemStyle(isActive("/projets"))}
            onMouseEnter={(e) => !isActive("/projets") && (e.target.style.backgroundColor = "#222")}
            onMouseLeave={(e) => !isActive("/projets") && (e.target.style.backgroundColor = "transparent")}
          >
            Projets
          </Link>
          <Link
            to="/admin/poles"
            style={menuItemStyle(isActive("/admin/poles"))}
            onMouseEnter={(e) => !isActive("/admin/poles") && (e.target.style.backgroundColor = "#222")}
            onMouseLeave={(e) => !isActive("/admin/poles") && (e.target.style.backgroundColor = "transparent")}
          >
            Pôles
          </Link>
          <Link
            to="/admin/users"
            style={menuItemStyle(isActive("/admin/users"))}
            onMouseEnter={(e) => !isActive("/admin/users") && (e.target.style.backgroundColor = "#222")}
            onMouseLeave={(e) => !isActive("/admin/users") && (e.target.style.backgroundColor = "transparent")}
          >
            Utilisateurs
          </Link>
        </nav>

        <div style={{ padding: "0 2rem", borderTop: "1px solid #333", paddingTop: "1rem" }}>
          {/* User info */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ color: "#999", fontSize: "0.85rem" }}>{user?.username}</div>
            <div style={{ color: "#666", fontSize: "0.75rem" }}>{user?.role}</div>
          </div>

          <a
            onClick={logout}
            style={{
              ...menuItemStyle(false),
              padding: "0.875rem 0",
              color: "#c0392b",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>⏻</span> Logout
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: "250px", flex: 1, padding: "2rem 3rem" }}>
        {children}
      </main>
    </div>
  );
}
