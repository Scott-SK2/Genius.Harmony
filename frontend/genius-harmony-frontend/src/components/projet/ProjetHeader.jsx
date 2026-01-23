import { Link } from "react-router-dom";
import { TYPE_LABELS, STATUT_LABELS, STATUT_COLORS } from "../../constants";

/**
 * ProjetHeader component - Displays project header with title, type, status
 * @param {Object} props
 * @param {Object} props.projet - Project object
 * @param {Object} props.permissions - User permissions object
 * @param {Function} props.onDelete - Callback for delete action
 * @param {Function} props.onChangeStatut - Callback to open status change modal
 */
export default function ProjetHeader({ projet, permissions, onDelete, onChangeStatut }) {
  if (!projet) return null;

  return (
    <div className="projet-header" style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ marginBottom: "0.5rem" }}>{projet.titre}</h1>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
            <span style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "4px",
              backgroundColor: "#f3f4f6",
              fontSize: "0.875rem"
            }}>
              {TYPE_LABELS[projet.type] || projet.type}
            </span>
            <span
              style={{
                padding: "0.25rem 0.75rem",
                borderRadius: "4px",
                backgroundColor: STATUT_COLORS[projet.statut] || "#e5e7eb",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: permissions.canChangeStatut ? "pointer" : "default"
              }}
              onClick={permissions.canChangeStatut ? onChangeStatut : undefined}
              title={permissions.canChangeStatut ? "Cliquer pour changer le statut" : ""}
            >
              {STATUT_LABELS[projet.statut] || projet.statut}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {permissions.canEditProjet && (
            <Link
              to={`/projets/${projet.id}/edit`}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#7c3aed",
                color: "#fff",
                borderRadius: "4px",
                textDecoration: "none"
              }}
            >
              Modifier
            </Link>
          )}
          {permissions.canDeleteProjet && (
            <button
              onClick={onDelete}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Supprimer
            </button>
          )}
        </div>
      </div>

      {projet.description && (
        <p style={{ color: "#6b7280", marginTop: "1rem" }}>{projet.description}</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {projet.pole_details && (
          <div>
            <strong>Pôle:</strong> {projet.pole_details.nom}
          </div>
        )}
        {projet.chef_projet_details && (
          <div>
            <strong>Chef de projet:</strong> {projet.chef_projet_details.username}
          </div>
        )}
        {projet.client_details && (
          <div>
            <strong>Client:</strong> {projet.client_details.username}
          </div>
        )}
        {projet.date_debut && (
          <div>
            <strong>Date de début:</strong> {new Date(projet.date_debut).toLocaleDateString()}
          </div>
        )}
        {projet.date_fin_prevue && (
          <div>
            <strong>Date de fin prévue:</strong> {new Date(projet.date_fin_prevue).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
