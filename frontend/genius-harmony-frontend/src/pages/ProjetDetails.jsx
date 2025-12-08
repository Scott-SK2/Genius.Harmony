import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchProjetDetails } from "../api/projets";
import FormTache from "../components/FormTache";
import UploadDocument from "../components/UploadDocument";

const TYPE_LABELS = {
  film: "Film",
  court_metrage: "Court métrage",
  web_serie: "Web série",
  event: "Event",
  atelier_animation: "Atelier/Animation",
  musique: "Musique",
  autre: "Autre",
};

const STATUT_LABELS = {
  brouillon: "Brouillon",
  en_attente: "En attente",
  en_cours: "En cours",
  en_revision: "En révision",
  termine: "Terminé",
  annule: "Annulé",
};

const STATUT_COLORS = {
  brouillon: "#999",
  en_attente: "#f39c12",
  en_cours: "#3498db",
  en_revision: "#9b59b6",
  termine: "#27ae60",
  annule: "#e74c3c",
};

const TACHE_STATUT_LABELS = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
};

const TACHE_PRIORITE_LABELS = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

const PRIORITE_COLORS = {
  basse: "#95a5a6",
  normale: "#3498db",
  haute: "#f39c12",
  urgente: "#e74c3c",
};

export default function ProjetDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormTache, setShowFormTache] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);

  const loadProjet = async () => {
    if (!token || !id) return;
    try {
      setLoading(true);
      const data = await fetchProjetDetails(token, id);
      setProjet(data);
    } catch (err) {
      console.error("Erreur fetch projet details:", err);
      setError("Impossible de charger les détails du projet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjet();
  }, [token, id]);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Chargement du projet...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <div style={{ color: "#e74c3c", marginBottom: "1rem" }}>
          <strong>Erreur :</strong> {error}
        </div>
        <Link to="/projets" style={{ color: "#3498db" }}>
          ← Retour à la liste des projets
        </Link>
      </div>
    );
  }

  if (!projet) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Projet introuvable</p>
        <Link to="/projets" style={{ color: "#3498db" }}>
          ← Retour à la liste des projets
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px" }}>
      {/* Navigation */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to="/projets" style={{ color: "#3498db", textDecoration: "none" }}>
          ← Retour à la liste
        </Link>
      </div>

      {/* En-tête du projet */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <h1 style={{ margin: 0 }}>{projet.titre}</h1>
          <span
            style={{
              display: "inline-block",
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "500",
              backgroundColor: STATUT_COLORS[projet.statut] || "#999",
              color: "#fff",
            }}
          >
            {STATUT_LABELS[projet.statut] || projet.statut}
          </span>
        </div>

        <div style={{ color: "#666", fontSize: "0.95rem" }}>
          <span style={{ marginRight: "1.5rem" }}>
            <strong>Type:</strong> {TYPE_LABELS[projet.type] || projet.type}
          </span>
          {projet.pole_details && (
            <span style={{ marginRight: "1.5rem" }}>
              <strong>Pôle:</strong> {projet.pole_details.name}
            </span>
          )}
          {projet.date_debut && (
            <span>
              <strong>Début:</strong> {new Date(projet.date_debut).toLocaleDateString("fr-FR")}
            </span>
          )}
          {projet.date_fin_prevue && (
            <span style={{ marginLeft: "1rem" }}>
              <strong>Fin prévue:</strong> {new Date(projet.date_fin_prevue).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {projet.description && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Description</h3>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{projet.description}</p>
        </div>
      )}

      {/* Équipe */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>Équipe du projet</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          {projet.client_details && (
            <div style={{ padding: "1rem", backgroundColor: "#ecf0f1", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.25rem" }}>Client</div>
              <div style={{ fontWeight: "500" }}>{projet.client_details.username}</div>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>{projet.client_details.email}</div>
            </div>
          )}

          {projet.chef_projet_details && (
            <div style={{ padding: "1rem", backgroundColor: "#ecf0f1", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.25rem" }}>Chef de projet</div>
              <div style={{ fontWeight: "500" }}>{projet.chef_projet_details.username}</div>
              <div style={{ fontSize: "0.85rem", color: "#666" }}>{projet.chef_projet_details.email}</div>
            </div>
          )}
        </div>

        {projet.membres_details && projet.membres_details.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h3>Membres de l'équipe ({projet.membres_details.length})</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
              {projet.membres_details.map((membre) => (
                <div
                  key={membre.id}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                  }}
                >
                  <div style={{ fontWeight: "500" }}>{membre.username}</div>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>{membre.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tâches */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Tâches ({projet.taches?.length || 0})</h2>
          <button
            onClick={() => setShowFormTache(true)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#1abc9c",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            + Nouvelle tâche
          </button>
        </div>
        {!projet.taches || projet.taches.length === 0 ? (
          <p style={{ color: "#666" }}>Aucune tâche pour ce projet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.75rem" }}>Titre</th>
                <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.75rem" }}>Statut</th>
                <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.75rem" }}>Priorité</th>
                <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.75rem" }}>Assigné à</th>
                <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.75rem" }}>Deadline</th>
              </tr>
            </thead>
            <tbody>
              {projet.taches.map((tache) => (
                <tr key={tache.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.75rem" }}>{tache.titre}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{ fontSize: "0.85rem" }}>
                      {TACHE_STATUT_LABELS[tache.statut] || tache.statut}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        backgroundColor: PRIORITE_COLORS[tache.priorite] || "#999",
                        color: "#fff",
                      }}
                    >
                      {TACHE_PRIORITE_LABELS[tache.priorite] || tache.priorite}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                    {tache.assigne_a_details?.username || "—"}
                  </td>
                  <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                    {tache.deadline ? new Date(tache.deadline).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Documents */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Documents ({projet.documents?.length || 0})</h2>
          <button
            onClick={() => setShowUploadDoc(true)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            + Uploader un document
          </button>
        </div>
        {!projet.documents || projet.documents.length === 0 ? (
          <p style={{ color: "#666" }}>Aucun document pour ce projet.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {projet.documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: "1rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>{doc.titre}</div>
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>
                    Type: {doc.type} | Uploadé par {doc.uploade_par_details?.username || "—"} le{" "}
                    {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </div>
                  {doc.description && (
                    <div style={{ fontSize: "0.85rem", color: "#555", marginTop: "0.5rem" }}>
                      {doc.description}
                    </div>
                  )}
                </div>
                {doc.fichier_url && (
                  <a
                    href={doc.fichier_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#3498db",
                      color: "#fff",
                      borderRadius: "4px",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                    }}
                  >
                    Télécharger
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informations Odoo (si disponibles) */}
      {(projet.odoo_project_id || projet.odoo_invoice_id) && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#e8f4f8",
            borderRadius: "6px",
            borderLeft: "4px solid #3498db",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Informations Odoo</h3>
          {projet.odoo_project_id && (
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>ID Projet Odoo:</strong> {projet.odoo_project_id}
            </div>
          )}
          {projet.odoo_invoice_id && (
            <div>
              <strong>ID Facture Odoo:</strong> {projet.odoo_invoice_id}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <FormTache
        isOpen={showFormTache}
        onClose={() => setShowFormTache(false)}
        projetId={parseInt(id)}
        onSuccess={loadProjet}
      />

      <UploadDocument
        isOpen={showUploadDoc}
        onClose={() => setShowUploadDoc(false)}
        projetId={parseInt(id)}
        onSuccess={loadProjet}
      />
    </div>
  );
}
