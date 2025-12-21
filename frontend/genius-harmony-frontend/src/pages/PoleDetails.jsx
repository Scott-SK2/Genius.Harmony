import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchPoleDetails } from "../api/poles";
import { fetchProjets } from "../api/projets";
import { fetchUsers } from "../api/users";

const STATUT_PROJET_LABELS = {
  brouillon: "Brouillon",
  en_attente: "En attente",
  en_cours: "En cours",
  en_revision: "En révision",
  termine: "Terminé",
  annule: "Annulé",
};

const STATUT_COLORS = {
  brouillon: "#6b7280",
  en_attente: "#f59e0b",
  en_cours: "#3b82f6",
  en_revision: "#8b5cf6",
  termine: "#10b981",
  annule: "#ef4444",
};

export default function PoleDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [pole, setPole] = useState(null);
  const [projets, setProjets] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) return;

    (async () => {
      try {
        setLoading(true);
        const [poleData, projetsData, usersData] = await Promise.all([
          fetchPoleDetails(token, id),
          fetchProjets(token),
          fetchUsers(token),
        ]);

        setPole(poleData);

        // Filtrer les projets de ce pôle
        const projetsFiltered = projetsData.filter((p) => p.pole === parseInt(id));
        setProjets(projetsFiltered);

        // Filtrer les membres de ce pôle
        const membresFiltered = usersData.filter((u) => u.pole === parseInt(id));
        setMembres(membresFiltered);
      } catch (err) {
        console.error("Erreur fetch pole details:", err);
        alert("Erreur lors du chargement des détails du pôle");
        navigate("/admin/poles");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, id, navigate]);

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

  if (!pole) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "#ef4444" }}>Pôle non trouvé</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "100%" }}>
      {/* Header avec bouton retour */}
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={() => navigate("/admin/poles")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#4c1d95",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "500",
          }}
        >
          ← Retour
        </button>
        <h1 style={{ margin: 0, color: "#fff", fontSize: "2rem" }}>
          🎯 {pole.name}
        </h1>
      </div>

      {/* Informations du pôle */}
      <div
        style={{
          backgroundColor: "#2d1b69",
          padding: "2rem",
          borderRadius: "12px",
          border: "1px solid #4c1d95",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: "1.5rem", color: "#fff", fontSize: "1.5rem" }}>
          Informations
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.85rem", color: "#a78bfa", marginBottom: "0.5rem" }}>
              Description
            </div>
            <div style={{ color: "#fff", fontSize: "1rem" }}>
              {pole.description || "Aucune description"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.85rem", color: "#a78bfa", marginBottom: "0.5rem" }}>
              Chef de pôle
            </div>
            <div style={{ color: "#fff", fontSize: "1rem" }}>
              {pole.chef_username ? (
                <Link
                  to={`/users/${pole.chef}/profile`}
                  style={{
                    color: "#7c3aed",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                >
                  {pole.chef_username} ({pole.chef_email})
                </Link>
              ) : (
                "Non assigné"
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <div style={{ textAlign: "center", padding: "1rem", backgroundColor: "#1e1b4b", borderRadius: "8px" }}>
            <div style={{ fontSize: "2rem", color: "#7c3aed", fontWeight: "bold" }}>
              {projets.length}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#c4b5fd" }}>Projets</div>
          </div>
          <div style={{ textAlign: "center", padding: "1rem", backgroundColor: "#1e1b4b", borderRadius: "8px" }}>
            <div style={{ fontSize: "2rem", color: "#7c3aed", fontWeight: "bold" }}>
              {membres.length}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#c4b5fd" }}>Membres</div>
          </div>
          <div style={{ textAlign: "center", padding: "1rem", backgroundColor: "#1e1b4b", borderRadius: "8px" }}>
            <div style={{ fontSize: "2rem", color: "#10b981", fontWeight: "bold" }}>
              {projets.filter((p) => p.statut === "en_cours").length}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#c4b5fd" }}>En cours</div>
          </div>
        </div>
      </div>

      {/* Projets associés */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ margin: 0, marginBottom: "1.5rem", color: "#fff", fontSize: "1.5rem" }}>
          Projets associés
        </h2>
        {projets.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: "#2d1b69",
              borderRadius: "12px",
              border: "1px dashed #4c1d95",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <p style={{ margin: 0, color: "#c4b5fd" }}>Aucun projet associé à ce pôle</p>
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
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #4c1d95" }}>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#c4b5fd", fontWeight: "500" }}>
                    Titre
                  </th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#c4b5fd", fontWeight: "500" }}>
                    Statut
                  </th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#c4b5fd", fontWeight: "500" }}>
                    Chef de projet
                  </th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "#c4b5fd", fontWeight: "500" }}>
                    Membres
                  </th>
                </tr>
              </thead>
              <tbody>
                {projets.map((projet) => (
                  <tr
                    key={projet.id}
                    style={{
                      borderBottom: "1px solid #4c1d95",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => navigate(`/projets/${projet.id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4c1d95")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "1rem", color: "#fff", fontWeight: "500" }}>
                      {projet.titre}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          backgroundColor: `${STATUT_COLORS[projet.statut]}20`,
                          color: STATUT_COLORS[projet.statut],
                          fontSize: "0.85rem",
                          fontWeight: "500",
                        }}
                      >
                        {STATUT_PROJET_LABELS[projet.statut] || projet.statut}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", color: "#c4b5fd" }}>
                      {projet.chef_projet_username || "—"}
                    </td>
                    <td style={{ padding: "1rem", color: "#c4b5fd" }}>
                      {projet.membres_count || 0} membre{projet.membres_count > 1 ? "s" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Membres du pôle */}
      <div>
        <h2 style={{ margin: 0, marginBottom: "1.5rem", color: "#fff", fontSize: "1.5rem" }}>
          Membres du pôle
        </h2>
        {membres.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: "#2d1b69",
              borderRadius: "12px",
              border: "1px dashed #4c1d95",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
            <p style={{ margin: 0, color: "#c4b5fd" }}>Aucun membre assigné à ce pôle</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {membres.map((membre) => (
              <Link
                key={membre.id}
                to={`/users/${membre.id}/profile`}
                style={{
                  textDecoration: "none",
                  backgroundColor: "#2d1b69",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid #4c1d95",
                  transition: "all 0.2s",
                  display: "block",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#7c3aed";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#4c1d95";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#4c1d95",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                    }}
                  >
                    👤
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontWeight: "600", fontSize: "1rem" }}>
                      {membre.username}
                    </div>
                    <div style={{ color: "#a78bfa", fontSize: "0.85rem" }}>
                      {membre.role}
                    </div>
                  </div>
                </div>
                <div style={{ color: "#c4b5fd", fontSize: "0.9rem" }}>
                  {membre.email}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
