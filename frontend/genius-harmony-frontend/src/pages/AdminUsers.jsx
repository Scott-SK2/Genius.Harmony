import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchUsers, updateUser, deleteUser } from "../api/users";

const ROLE_LABELS = {
  super_admin: "Super Administrateur",
  admin: "Administrateur",
  chef_pole: "Chef de pôle",
  membre: "Membre",
  stagiaire: "Stagiaire",
  collaborateur: "Collaborateur",
  artiste: "Artiste",
  client: "Client",
  partenaire: "Partenaire",
};

const ROLE_OPTIONS = [
  "super_admin",
  "admin",
  "chef_pole",
  "membre",
  "stagiaire",
  "collaborateur",
  "artiste",
  "client",
  "partenaire",
];

const SPECIALITE_LABELS = {
  "": "Non spécifié",
  musicien: "Musicien",
  manager: "Manager",
  model: "Modèle",
  photographe: "Photographe",
  videaste: "Vidéaste",
  graphiste: "Graphiste",
  developpeur: "Développeur",
  commercial: "Commercial",
  assistant: "Assistant",
  autre: "Autre",
};

const SPECIALITE_OPTIONS = [
  "",
  "musicien",
  "manager",
  "model",
  "photographe",
  "videaste",
  "graphiste",
  "developpeur",
  "commercial",
  "assistant",
  "autre",
];

export default function AdminUsers() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [savingId, setSavingId] = useState(null);

  // Vérifier si l'utilisateur peut modifier
  const canEdit = user && (user.role === 'admin' || user.role === 'super_admin');

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const u = await fetchUsers(token);
        setUsers(u);
      } catch (err) {
        console.error("Erreur fetch users:", err);
      }
    })();
  }, [token]);

  async function handleChangeRole(userId, newRole) {
    try {
      setSavingId(userId);
      const updated = await updateUser(token, userId, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u))
      );
    } catch (err) {
      console.error("Erreur update role:", err);
      alert("Impossible de changer le rôle");
    } finally {
      setSavingId(null);
    }
  }

  async function handleChangeSpecialite(userId, newSpecialite) {
    try {
      setSavingId(userId);
      const updated = await updateUser(token, userId, { membre_specialite: newSpecialite });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, membre_specialite: updated.membre_specialite } : u
        )
      );
    } catch (err) {
      console.error("Erreur update spécialité:", err);
      alert("Impossible de changer la spécialité");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDeleteUser(userId, username) {
    const confirmation = window.confirm(
      `Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ?\n\nCette action est irréversible et supprimera également toutes les données associées à cet utilisateur.`
    );

    if (!confirmation) return;

    try {
      setSavingId(userId);
      await deleteUser(token, userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Erreur suppression utilisateur:", err);
      alert("Impossible de supprimer l'utilisateur");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      {users.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            backgroundColor: "#2d1b69",
            borderRadius: "12px",
            border: "1px solid #4c1d95",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>👤</div>
          <p style={{ margin: 0, color: "#c4b5fd", fontSize: "1.1rem" }}>
            Aucun utilisateur trouvé.
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#2d1b69",
            borderRadius: "12px",
            border: "1px solid #4c1d95",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Username
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Rôle
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Spécialité
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#c4b5fd",
                    fontWeight: "500",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: "1px solid #4c1d95",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#4c1d95";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <td style={{ padding: "1rem", color: "#a78bfa" }}>
                    #{u.id}
                  </td>
                  <td style={{ padding: "1rem", color: "#fff", fontWeight: "500" }}>
                    {u.username}
                  </td>
                  <td style={{ padding: "1rem", color: "#c4b5fd" }}>
                    {u.email}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {canEdit ? (
                      <select
                        value={u.role || ""}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        disabled={savingId === u.id}
                        style={{
                          padding: "0.5rem 0.75rem",
                          borderRadius: "8px",
                          border: "1px solid #4c1d95",
                          backgroundColor: "#1e1b4b",
                          color: "#fff",
                          fontSize: "0.95rem",
                          cursor: "pointer",
                          minWidth: "160px",
                        }}
                      >
                        <option value="">—</option>
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: "#c4b5fd", fontSize: "0.95rem" }}>
                        {ROLE_LABELS[u.role] || "—"}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {(u.role === 'membre' || u.role === 'chef_pole') ? (
                      canEdit ? (
                        <select
                          value={u.membre_specialite || ""}
                          onChange={(e) => handleChangeSpecialite(u.id, e.target.value)}
                          disabled={savingId === u.id}
                          style={{
                            padding: "0.5rem 0.75rem",
                            borderRadius: "8px",
                            border: "1px solid #4c1d95",
                            backgroundColor: "#1e1b4b",
                            color: "#fff",
                            fontSize: "0.95rem",
                            cursor: "pointer",
                            minWidth: "160px",
                          }}
                        >
                          {SPECIALITE_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {SPECIALITE_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ color: "#c4b5fd", fontSize: "0.95rem" }}>
                          {SPECIALITE_LABELS[u.membre_specialite] || SPECIALITE_LABELS[""]}
                        </span>
                      )
                    ) : (
                      <span style={{ color: "#666", fontSize: "0.9rem" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link
                        to={`/users/${u.id}/profile`}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#7c3aed",
                          color: "#fff",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          display: "inline-block",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#6d32d1";
                          e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#7c3aed";
                          e.target.style.transform = "translateY(0)";
                        }}
                      >
                        👁️ Voir
                      </Link>
                      {canEdit && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.username)}
                          disabled={savingId === u.id}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#f87171",
                            color: "#fff",
                            borderRadius: "8px",
                            border: "none",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            cursor: savingId === u.id ? "wait" : "pointer",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (savingId !== u.id) {
                              e.target.style.backgroundColor = "#ef4444";
                              e.target.style.transform = "translateY(-2px)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (savingId !== u.id) {
                              e.target.style.backgroundColor = "#f87171";
                              e.target.style.transform = "translateY(0)";
                            }
                          }}
                        >
                          🗑️ Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
