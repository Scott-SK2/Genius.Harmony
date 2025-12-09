import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { fetchPoles, createPole, updatePole, deletePole } from "../api/poles";
import { fetchUsers } from "../api/users";

export default function AdminPoles() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [poles, setPoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPole, setEditingPole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chef: "",
  });

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        const [polesData, usersData] = await Promise.all([
          fetchPoles(token),
          fetchUsers(token),
        ]);
        setPoles(polesData);
        setUsers(usersData);
      } catch (err) {
        console.error("Erreur fetch poles/users:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleOpenModal = (pole = null) => {
    if (pole) {
      setEditingPole(pole);
      setFormData({
        name: pole.name,
        description: pole.description || "",
        chef: pole.chef || "",
      });
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
        setPoles((prev) =>
          prev.map((p) => (p.id === editingPole.id ? updated : p))
        );
      } else {
        const created = await createPole(token, payload);
        setPoles((prev) => [...prev, created]);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Erreur save pole:", err);
      alert("Impossible de sauvegarder le pôle");
    }
  };

  const handleDelete = async (poleId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce pôle ?")) {
      return;
    }

    try {
      await deletePole(token, poleId);
      setPoles((prev) => prev.filter((p) => p.id !== poleId));
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
          color: theme.text.secondary,
          fontSize: "1.1rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <div>Chargement des pôles...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              marginBottom: "0.5rem",
              color: theme.text.primary,
              fontSize: "2rem",
            }}
          >
            🎯 Gestion des Pôles
          </h1>
          <p
            style={{
              margin: 0,
              color: theme.text.secondary,
              fontSize: "1.05rem",
            }}
          >
            Créez et gérez les pôles de votre organisation
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: theme.colors.primary,
            color: theme.text.inverse,
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: theme.shadow.sm,
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = theme.shadow.lg;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = theme.shadow.sm;
          }}
        >
          ➕ Créer un pôle
        </button>
      </div>

      {/* Liste des pôles */}
      {poles.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            backgroundColor: theme.bg.card,
            borderRadius: "12px",
            border: `1px dashed ${theme.border.medium}`,
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎯</div>
          <p
            style={{
              margin: 0,
              color: theme.text.secondary,
              fontSize: "1.1rem",
            }}
          >
            Aucun pôle trouvé. Créez-en un pour commencer !
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {poles.map((pole) => (
            <div
              key={pole.id}
              style={{
                backgroundColor: theme.bg.card,
                borderRadius: "12px",
                padding: "1.5rem",
                border: `1px solid ${theme.border.light}`,
                boxShadow: theme.shadow.md,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme.shadow.lg;
                e.currentTarget.style.borderColor = theme.border.medium;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = theme.shadow.md;
                e.currentTarget.style.borderColor = theme.border.light;
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: "0.75rem",
                      color: theme.text.primary,
                      fontSize: "1.3rem",
                    }}
                  >
                    {pole.name}
                  </h3>
                  {pole.description && (
                    <p
                      style={{
                        margin: 0,
                        marginBottom: "1rem",
                        color: theme.text.secondary,
                        lineHeight: "1.6",
                      }}
                    >
                      {pole.description}
                    </p>
                  )}
                  {pole.chef_username && (
                    <div
                      style={{
                        display: "inline-block",
                        padding: "0.5rem 1rem",
                        backgroundColor: `${theme.colors.primary}20`,
                        color: theme.colors.primary,
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        border: `1px solid ${theme.colors.primary}40`,
                      }}
                    >
                      👤 Chef : {pole.chef_username}
                    </div>
                  )}
                  {!pole.chef_username && (
                    <div
                      style={{
                        display: "inline-block",
                        padding: "0.5rem 1rem",
                        backgroundColor: `${theme.text.secondary}20`,
                        color: theme.text.secondary,
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        border: `1px solid ${theme.text.secondary}40`,
                      }}
                    >
                      ⚠️ Aucun chef désigné
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => handleOpenModal(pole)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: theme.bg.secondary,
                      color: theme.text.primary,
                      border: `1px solid ${theme.border.medium}`,
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = theme.bg.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = theme.bg.secondary;
                    }}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(pole.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: `${theme.colors.danger}20`,
                      color: theme.colors.danger,
                      border: `1px solid ${theme.colors.danger}40`,
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = theme.colors.danger;
                      e.target.style.color = theme.text.inverse;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = `${theme.colors.danger}20`;
                      e.target.style.color = theme.colors.danger;
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: theme.bg.card,
              borderRadius: "12px",
              padding: "2rem",
              width: "90%",
              maxWidth: "500px",
              boxShadow: theme.shadow.xl,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: 0,
                marginBottom: "1.5rem",
                color: theme.text.primary,
                fontSize: "1.5rem",
              }}
            >
              {editingPole ? "Modifier le pôle" : "Créer un pôle"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Nom du pôle *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: `1px solid ${theme.border.medium}`,
                    backgroundColor: theme.bg.primary,
                    color: theme.text.primary,
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: `1px solid ${theme.border.medium}`,
                    backgroundColor: theme.bg.primary,
                    color: theme.text.primary,
                    fontSize: "1rem",
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Chef de pôle
                </label>
                <select
                  value={formData.chef}
                  onChange={(e) =>
                    setFormData({ ...formData, chef: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: `1px solid ${theme.border.medium}`,
                    backgroundColor: theme.bg.primary,
                    color: theme.text.primary,
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
                    backgroundColor: theme.bg.secondary,
                    color: theme.text.primary,
                    border: `1px solid ${theme.border.medium}`,
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: theme.colors.primary,
                    color: theme.text.inverse,
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
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
