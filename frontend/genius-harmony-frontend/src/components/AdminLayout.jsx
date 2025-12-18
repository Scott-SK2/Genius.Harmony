import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function AdminLayout({ children, pageTitle = "Dashboard" }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

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
    <div style={{ display: "flex", flexDirection: "column", backgroundColor: "#1e1b4b", minHeight: "100vh" }}>
      {/* Top Header */}
      <header
        style={{
          backgroundColor: "#7c3aed",
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2rem",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Left: Logo + Menu */}
        <div ref={menuRef} style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
          <div
            onClick={() => setShowMenu(!showMenu)}
            style={{
              color: "#fff",
              fontSize: "1.3rem",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🎭 Genius Harmony
            <span style={{ fontSize: "0.8rem", transition: "transform 0.2s", transform: showMenu ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
          </div>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "1rem",
                backgroundColor: "#2d1b69",
                border: "1px solid #a78bfa",
                borderRadius: "8px",
                minWidth: "200px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                zIndex: 1000,
              }}
            >
              <Link
                to="/admin/dashboard"
                onClick={() => setShowMenu(false)}
                style={{
                  display: "block",
                  padding: "0.875rem 1.5rem",
                  color: "#fff",
                  textDecoration: "none",
                  borderBottom: "1px solid #4c1d95",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#4c1d95")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                📊 Dashboard
              </Link>
              <Link
                to="/projets"
                onClick={() => setShowMenu(false)}
                style={{
                  display: "block",
                  padding: "0.875rem 1.5rem",
                  color: "#fff",
                  textDecoration: "none",
                  borderBottom: "1px solid #4c1d95",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#4c1d95")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                📋 Projets
              </Link>
              <Link
                to="/admin/poles"
                onClick={() => setShowMenu(false)}
                style={{
                  display: "block",
                  padding: "0.875rem 1.5rem",
                  color: "#fff",
                  textDecoration: "none",
                  borderBottom: "1px solid #4c1d95",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#4c1d95")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                🎯 Pôles
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setShowMenu(false)}
                style={{
                  display: "block",
                  padding: "0.875rem 1.5rem",
                  color: "#fff",
                  textDecoration: "none",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#4c1d95")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                👥 Utilisateurs
              </Link>
            </div>
          )}
        </div>

        {/* Center: Page Title */}
        <h1 style={{ color: "#fff", margin: 0, fontSize: "1.5rem", fontWeight: "600" }}>
          {pageTitle}
        </h1>

        {/* Right: Profile + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              👤
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: "0.9rem", fontWeight: "500" }}>
                {user?.username}
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "rgba(255,255,255,0.3)")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "rgba(255,255,255,0.2)")}
          >
            ⏻ Déconnexion
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ marginTop: "70px", flex: 1, padding: "2rem 3rem", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        {children}
      </main>
    </div>
  );
}
