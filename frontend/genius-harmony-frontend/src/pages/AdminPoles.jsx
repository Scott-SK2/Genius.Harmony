import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchPoles, createPole, updatePole, deletePole } from "../api/poles";
import { fetchUsers } from "../api/users";

export default function AdminPoles() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
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

  // Vérifier si l'utilisateur peut modifier
  const canEdit = user && (user.role === 'admin' || user.role === 'super_admin');

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
        }}
      >
        <div style={{ fontSize: "3rem" }}>⏳</div>
      </div>
    );
  }

  return (
    <>
      {/* Bouton Créer un pôle - uniquement pour admins */}
      {canEdit && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2rem" }}>
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#6d28d9";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#7c3aed";
            }}
          >
            ➕ Créer un pôle
          </button>
        </div>
      )}

      {/* Liste des pôles */}
      {poles.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            backgroundColor: "#2d1b69",
            borderRadius: "12px",
            border: "1px solid #4c1d95",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎯</div>
          <p style={{ margin: 0, color: "#c4b5fd", fontSize: "1.1rem" }}>
            Aucun pôle trouvé. Créez-en un pour commencer !
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {poles.map((pole) => (
            <div
              key={pole.id}
              style={{
                backgroundColor: "#2d1b69",
                borderRadius: "12px",
                padding: "1.5rem",
                border: "1px solid #4c1d95",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/admin/poles/${pole.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#7c3aed";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#4c1d95";
                e.currentTarget.style.transform = "translateY(0)";
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
                      color: "#fff",
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
                        color: "#c4b5fd",
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
                        backgroundColor: "rgba(192, 57, 43, 0.2)",
                        color: "#7c3aed",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        border: "1px solid rgba(192, 57, 43, 0.4)",
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
                        backgroundColor: "rgba(153, 153, 153, 0.2)",
                        color: "#c4b5fd",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        border: "1px solid rgba(153, 153, 153, 0.4)",
                      }}
                    >
                      ⚠️ Aucun chef désigné
                    </div>
                  )}
                </div>
                {canEdit && (
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(pole);
                      }}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "transparent",
                        color: "#a78bfa",
                        border: "1px solid #a78bfa",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#a78bfa";
                        e.target.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#a78bfa";
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(pole.id);
                      }}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "transparent",
                        color: "#7c3aed",
                        border: "1px solid #7c3aed",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#7c3aed";
                        e.target.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.color = "#7c3aed";
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                )}
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
              backgroundColor: "#2d1b69",
              borderRadius: "12px",
              padding: "2rem",
              width: "90%",
              maxWidth: "500px",
              border: "1px solid #4c1d95",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: 0,
                marginBottom: "1.5rem",
                color: "#fff",
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
                    color: "#c4b5fd",
                    fontWeight: "500",
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
                    border: "1px solid #4c1d95",
                    backgroundColor: "#1e1b4b",
                    color: "#fff",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
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
                    border: "1px solid #4c1d95",
                    backgroundColor: "#1e1b4b",
                    color: "#fff",
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
                    color: "#c4b5fd",
                    fontWeight: "500",
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
                    backgroundColor: "#4c1d95",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
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
                    backgroundColor: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
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
    </>
  );
}
