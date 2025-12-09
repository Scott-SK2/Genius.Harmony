import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { fetchUsers, updateUser } from "../api/users";
import { fetchPoles } from "../api/poles";

const ROLE_LABELS = {
  admin: "Administrateur",
  chef_pole: "Chef de pôle",
  membre: "Membre",
  stagiaire: "Stagiaire",
  technicien: "Technicien",
  artiste: "Artiste",
  client: "Client",
  partenaire: "Partenaire",
};

const ROLE_OPTIONS = [
  "admin",
  "chef_pole",
  "membre",
  "stagiaire",
  "technicien",
  "artiste",
  "client",
  "partenaire",
];

export default function AdminUsers() {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [poles, setPoles] = useState([]);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const [u, p] = await Promise.all([
          fetchUsers(token),
          fetchPoles(token),
        ]);
        setUsers(u);
        setPoles(p);
      } catch (err) {
        console.error("Erreur fetch users/poles:", err);
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

  async function handleChangePole(userId, newPoleId) {
    try {
      setSavingId(userId);
      const payload =
        newPoleId === "" ? { pole: null } : { pole: parseInt(newPoleId, 10) };
      const updated = await updateUser(token, userId, payload);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, pole: updated.pole, pole_name: updated.pole_name }
            : u
        )
      );
    } catch (err) {
      console.error("Erreur update pole:", err);
      alert("Impossible de changer le pôle");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            margin: 0,
            marginBottom: "0.5rem",
            color: theme.text.primary,
            fontSize: "2rem",
          }}
        >
          👥 Gestion des utilisateurs
        </h1>
        <p style={{ margin: 0, color: theme.text.secondary, fontSize: "1.05rem" }}>
          Attribuez les rôles et les pôles aux utilisateurs
        </p>
      </div>

      {users.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            backgroundColor: theme.bg.card,
            borderRadius: "12px",
            border: `1px dashed ${theme.border.medium}`,
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>👤</div>
          <p style={{ margin: 0, color: theme.text.secondary, fontSize: "1.1rem" }}>
            Aucun utilisateur trouvé.
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: theme.bg.card,
            borderRadius: "12px",
            border: `1px solid ${theme.border.light}`,
            overflow: "hidden",
            boxShadow: theme.shadow.md,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: theme.bg.secondary }}>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "left",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "left",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Username
                </th>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "left",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "left",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Rôle
                </th>
                <th
                  style={{
                    borderBottom: `2px solid ${theme.border.medium}`,
                    textAlign: "left",
                    padding: "1rem",
                    color: theme.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Pôle
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: `1px solid ${theme.border.light}`,
                    backgroundColor: index % 2 === 0 ? theme.bg.card : theme.bg.tertiary,
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bg.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? theme.bg.card : theme.bg.tertiary;
                  }}
                >
                  <td style={{ padding: "1rem", color: theme.text.secondary }}>
                    #{u.id}
                  </td>
                  <td style={{ padding: "1rem", color: theme.text.primary, fontWeight: "600" }}>
                    {u.username}
                  </td>
                  <td style={{ padding: "1rem", color: theme.text.secondary }}>
                    {u.email}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <select
                      value={u.role || ""}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      disabled={savingId === u.id}
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        border: `1px solid ${theme.border.medium}`,
                        backgroundColor: theme.bg.primary,
                        color: theme.text.primary,
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
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <select
                        value={u.pole || ""}
                        onChange={(e) => handleChangePole(u.id, e.target.value)}
                        disabled={savingId === u.id}
                        style={{
                          padding: "0.5rem 0.75rem",
                          borderRadius: "8px",
                          border: `1px solid ${theme.border.medium}`,
                          backgroundColor: theme.bg.primary,
                          color: theme.text.primary,
                          fontSize: "0.95rem",
                          cursor: "pointer",
                          minWidth: "160px",
                        }}
                      >
                        <option value="">Aucun</option>
                        {poles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {u.pole_name && (
                        <span style={{ color: theme.text.tertiary, fontSize: "0.9rem" }}>
                          ({u.pole_name})
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
