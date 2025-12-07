import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchUsers, updateUser } from "../api/users";
import { fetchPoles } from "../api/poles";

const ROLE_LABELS = {
  admin: "Administrateur",
  chef_pole: "Chef de pôle",
  membre: "Membre",
  stagiaire: "Stagiaire",
  client: "Client / Artiste",
  partenaire: "Partenaire",
};

const ROLE_OPTIONS = [
  "admin",
  "chef_pole",
  "membre",
  "stagiaire",
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
    <div style={{ padding: "2rem" }}>
      <h1>Gestion des utilisateurs</h1>
      <p>Tu peux ici attribuer les rôles et les pôles.</p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem",
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              ID
            </th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              Username
            </th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              Email
            </th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              Rôle
            </th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              Pôle
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ padding: "0.5rem 0" }}>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role || ""}
                  onChange={(e) => handleChangeRole(u.id, e.target.value)}
                  disabled={savingId === u.id}
                >
                  <option value="">—</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={u.pole || ""}
                  onChange={(e) => handleChangePole(u.id, e.target.value)}
                  disabled={savingId === u.id}
                >
                  <option value="">Aucun</option>
                  {poles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {u.pole_name && (
                  <span style={{ marginLeft: "0.5rem", color: "#666" }}>
                    ({u.pole_name})
                  </span>
                )}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: "1rem" }}>
                Aucun utilisateur trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
