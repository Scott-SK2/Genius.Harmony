import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { fetchPoles, createPole, updatePole, deletePole } from "../api/poles";
import { fetchProjets } from "../api/projets";
import { fetchUsers } from "../api/users";

export default function AdminDashboard() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [poles, setPoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProjets: 0,
    totalUtilisateurs: 0,
    totalPoles: 0,
    projetsEnCours: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingPole, setEditingPole] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", chef: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        const [polesData, projetsData, usersData] = await Promise.all([
          fetchPoles(token),
          fetchProjets(token),
          fetchUsers(token),
        ]);

        setPoles(polesData);
        setUsers(usersData);

        setStats({
          totalProjets: projetsData.length,
          totalUtilisateurs: usersData.length,
          totalPoles: polesData.length,
          projetsEnCours: projetsData.filter((p) => p.statut === "en_cours").length,
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

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      {/* Stats Cards - 3 cartes alignées */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
          <div
            onClick={() => navigate("/projets")}
            style={{
              backgroundColor: "#2d1b69",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #4c1d95",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#a78bfa";
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#4c1d95";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: "#4c1d95",
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
                <div style={{ color: "#c4b5fd", fontSize: "0.9rem" }}>Projets</div>
                <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>{stats.totalProjets}</div>
              </div>
            </div>
            <div style={{ color: "#a78bfa", fontSize: "0.85rem" }}>Total des projets</div>
          </div>

          <div
            onClick={() => navigate("/admin/poles")}
            style={{
              backgroundColor: "#2d1b69",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #4c1d95",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#a78bfa";
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#4c1d95";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: "#4c1d95",
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
                <div style={{ color: "#c4b5fd", fontSize: "0.9rem" }}>Pôles</div>
                <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>{stats.totalPoles}</div>
              </div>
            </div>
            <div style={{ color: "#a78bfa", fontSize: "0.85rem" }}>Pôles définis</div>
          </div>

          <div
            onClick={() => navigate("/admin/users")}
            style={{
              backgroundColor: "#2d1b69",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #4c1d95",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#a78bfa";
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#4c1d95";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  backgroundColor: "#4c1d95",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                }}
              >
                👥
              </div>
              <div>
                <div style={{ color: "#c4b5fd", fontSize: "0.9rem" }}>Utilisateurs</div>
                <div style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>{stats.totalUtilisateurs}</div>
              </div>
            </div>
            <div style={{ color: "#a78bfa", fontSize: "0.85rem" }}>Membres de l'équipe</div>
          </div>
        </div>

        {/* Gestion des Pôles */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ color: "#fff", margin: 0, fontSize: "1.5rem" }}>Pôles récents</h3>
            <button
              onClick={() => handleOpenModal()}
              style={{
                backgroundColor: theme.colors.secondary,
                color: theme.text.inverse,
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s",
                boxShadow: theme.shadow.md,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.orangeLight;
                e.target.style.boxShadow = theme.shadow.lg;
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.colors.secondary;
                e.target.style.boxShadow = theme.shadow.md;
                e.target.style.transform = "translateY(0)";
              }}
            >
              + Ajouter un pôle
            </button>
          </div>

          <div style={{ backgroundColor: "#2d1b69", borderRadius: "12px", overflow: "hidden", border: "1px solid #4c1d95" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #4c1d95" }}>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#c4b5fd", fontWeight: "500" }}>Nom</th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#c4b5fd", fontWeight: "500" }}>Description</th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#c4b5fd", fontWeight: "500" }}>Chef de pôle</th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#c4b5fd", fontWeight: "500" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {poles.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: "2rem", textAlign: "center", color: "#a78bfa" }}>
                      Aucun pôle créé
                    </td>
                  </tr>
                ) : (
                  poles.map((pole) => (
                    <tr
                      key={pole.id}
                      style={{ borderBottom: "1px solid #4c1d95", transition: "background-color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4c1d95")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "1rem", color: "#fff", fontWeight: "500" }}>{pole.name}</td>
                      <td style={{ padding: "1rem", color: "#c4b5fd" }}>{pole.description || "-"}</td>
                      <td style={{ padding: "1rem", color: "#c4b5fd" }}>{pole.chef_username || "Non assigné"}</td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleOpenModal(pole)}
                            style={{
                              backgroundColor: "transparent",
                              color: "#a78bfa",
                              border: "1px solid #a78bfa",
                              padding: "0.5rem 1rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#a78bfa";
                              e.target.style.color = "#1e1b4b";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "transparent";
                              e.target.style.color = "#a78bfa";
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(pole.id)}
                            style={{
                              backgroundColor: "transparent",
                              color: "#f87171",
                              border: "1px solid #f87171",
                              padding: "0.5rem 1rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#f87171";
                              e.target.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "transparent";
                              e.target.style.color = "#f87171";
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

        {/* Modal */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(30, 27, 75, 0.9)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={handleCloseModal}
          >
            <div
              style={{
                backgroundColor: "#2d1b69",
                borderRadius: "12px",
                padding: "2rem",
                width: "90%",
                maxWidth: "500px",
                border: "1px solid #7c3aed",
                boxShadow: "0 8px 32px rgba(124, 58, 237, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ color: "#fff", margin: 0, marginBottom: "1.5rem" }}>
                {editingPole ? "Modifier le pôle" : "Créer un pôle"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#c4b5fd" }}>Nom du pôle *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #4c1d95",
                      backgroundColor: "#1e1b4b",
                      color: "#fff",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#c4b5fd" }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #4c1d95",
                      backgroundColor: "#1e1b4b",
                      color: "#fff",
                      fontSize: "1rem",
                      resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#c4b5fd" }}>Chef de pôle</label>
                  <select
                    value={formData.chef}
                    onChange={(e) => setFormData({ ...formData, chef: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #4c1d95",
                      backgroundColor: "#1e1b4b",
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
                      backgroundColor: theme.bg.tertiary,
                      color: theme.text.primary,
                      border: `1px solid ${theme.border.medium}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "500",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = theme.bg.hover)}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = theme.bg.tertiary)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      backgroundColor: theme.colors.secondary,
                      color: theme.text.inverse,
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "500",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = theme.colors.orangeLight)}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = theme.colors.secondary)}
                  >
                    {editingPole ? "Mettre à jour" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
