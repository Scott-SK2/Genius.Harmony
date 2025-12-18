import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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
    <>
      {users.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            border: "1px solid #333",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>👤</div>
          <p style={{ margin: 0, color: "#999", fontSize: "1.1rem" }}>
            Aucun utilisateur trouvé.
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            border: "1px solid #333",
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
                    borderBottom: "1px solid #333",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#999",
                    fontWeight: "500",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #333",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#999",
                    fontWeight: "500",
                  }}
                >
                  Username
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #333",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#999",
                    fontWeight: "500",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #333",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#999",
                    fontWeight: "500",
                  }}
                >
                  Rôle
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #333",
                    textAlign: "left",
                    padding: "1rem",
                    color: "#999",
                    fontWeight: "500",
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
                    borderBottom: "1px solid #222",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#222";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <td style={{ padding: "1rem", color: "#666" }}>
                    #{u.id}
                  </td>
                  <td style={{ padding: "1rem", color: "#fff", fontWeight: "500" }}>
                    {u.username}
                  </td>
                  <td style={{ padding: "1rem", color: "#999" }}>
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
                        border: "1px solid #333",
                        backgroundColor: "#0f0f0f",
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
                          border: "1px solid #333",
                          backgroundColor: "#0f0f0f",
                          color: "#fff",
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
                        <span style={{ color: "#666", fontSize: "0.9rem" }}>
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
    </>
  );
}
