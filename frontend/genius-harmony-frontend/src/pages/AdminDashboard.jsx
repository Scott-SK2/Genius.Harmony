import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { fetchPoles, createPole, updatePole, deletePole } from "../api/poles";
import { fetchProjets } from "../api/projets";
import { fetchTaches } from "../api/taches";
import { fetchUsers } from "../api/users";

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [poles, setPoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProjets: 0,
    totalTaches: 0,
    totalUtilisateurs: 0,
    totalPoles: 0,
    projetsEnCours: 0,
    tachesAFaire: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingPole, setEditingPole] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", chef: "" });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        const [polesData, projetsData, tachesData, usersData] = await Promise.all([
          fetchPoles(token),
          fetchProjets(token),
          fetchTaches(token),
          fetchUsers(token),
        ]);

        setPoles(polesData);
        setUsers(usersData);

        setStats({
          totalProjets: projetsData.length,
          totalTaches: tachesData.length,
          totalUtilisateurs: usersData.length,
          totalPoles: polesData.length,
          projetsEnCours: projetsData.filter((p) => p.statut === "en_cours").length,
          tachesAFaire: tachesData.filter((t) => t.statut === "a_faire").length,
        });
      } catch (err) {
        console.error("Erreur fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleOpenModal = (pole = null) => {
    if (pole) {
      setEditingPole(pole);
      setFormData({ name: pole.name, description: pole.description || "", chef: pole.chef || "" });
    } else {
      setEditingPole(null);
      setFormData({ name: "", description: "", chef: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPole(null);
    setFormData({ name: "", description: "", chef: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        chef: formData.chef === "" ? null : parseInt(formData.chef, 10),
      };

      if (editingPole) {
        const updated = await updatePole(token, editingPole.id, payload);
        setPoles((prev) => prev.map((p) => (p.id === editingPole.id ? updated : p)));
      } else {
        const created = await createPole(token, payload);
        setPoles((prev) => [...prev, created]);
        setStats((prev) => ({ ...prev, totalPoles: prev.totalPoles + 1 }));
      }
      handleCloseModal();
    } catch (err) {
      console.error("Erreur save pole:", err);
      alert("Impossible de sauvegarder le pôle");
    }
  };

  const handleDelete = async (poleId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce pôle ?")) return;

    try {
      await deletePole(token, poleId);
      setPoles((prev) => prev.filter((p) => p.id !== poleId));
      setStats((prev) => ({ ...prev, totalPoles: prev.totalPoles - 1 }));
    } catch (err) {
      console.error("Erreur delete pole:", err);
      alert("Impossible de supprimer le pôle");
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
        <div style={{ fontSize: "3rem" }}>⏳</div>
      </div>
    );
  }

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

  return (
    <div style={{ display: "flex", backgroundColor: "#0f0f0f", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={{ padding: "0 2rem", marginBottom: "3rem" }}>
          <h2 style={{ color: "#fff", margin: 0, fontSize: "1.5rem" }}>LOGO</h2>
        </div>

        <nav style={{ flex: 1 }}>
          <a
            onClick={() => setActiveView("dashboard")}
            style={menuItemStyle(activeView === "dashboard")}
            onMouseEnter={(e) => !( activeView === "dashboard") && (e.target.style.backgroundColor = "#222")}
            onMouseLeave={(e) => !(activeView === "dashboard") && (e.target.style.backgroundColor = "transparent")}
          >
            Dashboard
          </a>
          <Link
            to="/projets"
            style={menuItemStyle(false)}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#222")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            Projets
          </Link>
          <Link
            to="/admin/poles"
            style={menuItemStyle(false)}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#222")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            Pôles
          </Link>
          <Link
            to="/admin/users"
            style={menuItemStyle(false)}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#222")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            Utilisateurs
          </Link>
        </nav>

        <div style={{ padding: "0 2rem" }}>
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
        {/* Header */}
        <div
          style={{
            backgroundColor: "#c0392b",
            padding: "1.5rem 2rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 style={{ color: "#fff", margin: 0, fontSize: "1.8rem" }}>Dashboard Administrateur</h1>
          <button
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#fff",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            + Dashboard Administrateur
          </button>
        </div>

        <h2 style={{ color: "#fff", marginBottom: "2rem", fontSize: "2.5rem" }}>Dashboard</h2>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#1a1a1a",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #333",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: "#2c2c2c",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                📋
              </div>
              <div>
                <div style={{ color: "#999", fontSize: "0.9rem" }}>Projets</div>
                <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>{stats.totalProjets}</div>
              </div>
            </div>
            <div style={{ color: "#666", fontSize: "0.85rem" }}>En cours</div>
          </div>

          <div
            style={{
              backgroundColor: "#1a1a1a",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #333",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: "#2c2c2c",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                ✓
              </div>
              <div>
                <div style={{ color: "#999", fontSize: "0.9rem" }}>Tâches</div>
                <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>{stats.tachesAFaire}</div>
              </div>
            </div>
            <div style={{ color: "#666", fontSize: "0.85rem" }}>À faire</div>
          </div>

          <div
            style={{
              backgroundColor: "#1a1a1a",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #333",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: "#2c2c2c",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                🎯
              </div>
              <div>
                <div style={{ color: "#999", fontSize: "0.9rem" }}>Pôles</div>
                <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>{stats.totalPoles}</div>
              </div>
            </div>
            <div style={{ color: "#666", fontSize: "0.85rem" }}>Définis</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
          {/* Gestion des Pôles */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#fff", margin: 0, fontSize: "1.5rem" }}>Gestion des Pôles</h3>
              <button
                onClick={() => handleOpenModal()}
                style={{
                  backgroundColor: "#c0392b",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                + Ajouter un pôle
              </button>
            </div>

            <div style={{ backgroundColor: "#1a1a1a", borderRadius: "12px", overflow: "hidden", border: "1px solid #333" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #333" }}>
                    <th style={{ padding: "1rem", textAlign: "left", color: "#999", fontWeight: "500" }}>Nom</th>
                    <th style={{ padding: "1rem", textAlign: "left", color: "#999", fontWeight: "500" }}>Prôjets</th>
                    <th style={{ padding: "1rem", textAlign: "left", color: "#999", fontWeight: "500" }}>Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {poles.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                        Aucun pôle créé
                      </td>
                    </tr>
                  ) : (
                    poles.map((pole) => (
                      <tr key={pole.id} style={{ borderBottom: "1px solid #222" }}>
                        <td style={{ padding: "1rem", color: "#fff", fontWeight: "500" }}>{pole.name}</td>
                        <td style={{ padding: "1rem", color: "#999" }}>2 pôles</td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() => handleOpenModal(pole)}
                              style={{
                                backgroundColor: "transparent",
                                color: "#3498db",
                                border: "1px solid #3498db",
                                padding: "0.5rem 1rem",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                              }}
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(pole.id)}
                              style={{
                                backgroundColor: "transparent",
                                color: "#c0392b",
                                border: "1px solid #c0392b",
                                padding: "0.5rem 1rem",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                              }}
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Utilisateurs */}
          <div>
            <h3 style={{ color: "#fff", marginBottom: "1.5rem", fontSize: "1.5rem" }}>Utilisateurs</h3>

            <div style={{ backgroundColor: "#1a1a1a", padding: "2rem", borderRadius: "12px", border: "1px solid #333" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ fontSize: "2rem" }}>👥</div>
                <div>
                  <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>{stats.totalUtilisateurs}</div>
                  <div style={{ color: "#999", fontSize: "0.9rem" }}>Membres de l'équipe</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ fontSize: "2rem" }}>🎯</div>
                <div>
                  <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>{stats.totalPoles}</div>
                  <div style={{ color: "#999", fontSize: "0.9rem" }}>Pôles</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={handleCloseModal}
          >
            <div
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: "12px",
                padding: "2rem",
                width: "90%",
                maxWidth: "500px",
                border: "1px solid #333",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ color: "#fff", margin: 0, marginBottom: "1.5rem" }}>
                {editingPole ? "Modifier le pôle" : "Créer un pôle"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#999" }}>Nom du pôle *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #333",
                      backgroundColor: "#0f0f0f",
                      color: "#fff",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#999" }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #333",
                      backgroundColor: "#0f0f0f",
                      color: "#fff",
                      fontSize: "1rem",
                      resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#999" }}>Chef de pôle</label>
                  <select
                    value={formData.chef}
                    onChange={(e) => setFormData({ ...formData, chef: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #333",
                      backgroundColor: "#0f0f0f",
                      color: "#fff",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">Aucun chef désigné</option>
                    {users
                      .filter((u) => u.role === "chef_pole")
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username} ({u.email})
                        </option>
                      ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      backgroundColor: "#333",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      backgroundColor: "#c0392b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    {editingPole ? "Mettre à jour" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
