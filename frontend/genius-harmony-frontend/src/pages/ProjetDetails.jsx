import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import { fetchProjetDetails, updateProjetStatut, deleteProjet } from "../api/projets";
import { updateTache } from "../api/taches";
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

export default function ProjetDetails() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormTache, setShowFormTache] = useState(false);
  const [editingTache, setEditingTache] = useState(null);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [isChangingStatut, setIsChangingStatut] = useState(false);
  const [showManageMembres, setShowManageMembres] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

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

  const STATUT_COLORS = {
    brouillon: "#c4b5fd",
    en_attente: "#f59e0b",
    en_cours: "#7c3aed",
    en_revision: "#a78bfa",
    termine: "#10b981",
    annule: "#f87171",
  };

  const PRIORITE_COLORS = {
    basse: "#c4b5fd",
    normale: "#7c3aed",
    haute: "#f59e0b",
    urgente: "#f87171",
  };

  // Fonction pour vérifier si l'utilisateur peut changer le statut
  const canChangeStatut = () => {
    if (!projet || !user) return false;

    // Admin peut tout faire
    if (user.role === 'admin' || user.role === 'super_admin') return true;

    // Créateur du projet peut changer le statut
    if (projet.created_by === user.id) return true;

    // Chef de pôle peut changer le statut des projets de son pôle
    if (user.role === 'chef_pole' && projet.pole === user.pole) return true;

    // Chef de projet peut mettre en_revision, termine, annule uniquement
    if (projet.chef_projet === user.id) return true;

    return false;
  };

  // Fonction pour déterminer les statuts disponibles selon le rôle
  const getAvailableStatuts = () => {
    if (!projet || !user) return [];

    const allStatuts = ['brouillon', 'en_attente', 'en_cours', 'en_revision', 'termine', 'annule'];

    // Admin et Super Admin peuvent tout faire
    if (user.role === 'admin' || user.role === 'super_admin') return allStatuts;

    // Créateur et chef de pôle peuvent accéder à tous les statuts
    if (projet.created_by === user.id || (user.role === 'chef_pole' && projet.pole === user.pole)) {
      return allStatuts;
    }

    // Chef de projet peut seulement mettre en_revision, termine, annule
    if (projet.chef_projet === user.id) {
      return ['en_revision', 'termine', 'annule'];
    }

    return [];
  };

  // Fonction pour changer le statut du projet
  const handleChangeStatut = async (nouveauStatut) => {
    if (!canChangeStatut()) return;

    setIsChangingStatut(true);
    try {
      const updatedProjet = await updateProjetStatut(token, id, nouveauStatut);
      setProjet(updatedProjet);
    } catch (err) {
      console.error("Erreur changement statut:", err);
      setError("Impossible de changer le statut du projet");
    } finally {
      setIsChangingStatut(false);
    }
  };

  // Fonction pour vérifier si l'utilisateur peut gérer les membres
  const canManageMembres = () => {
    if (!projet || !user) return false;

    // Admin peut tout faire
    if (user.role === 'admin' || user.role === 'super_admin') return true;

    // Chef de pôle peut gérer les projets de son pôle
    if (user.role === 'chef_pole' && projet.pole === user.pole) return true;

    // Chef de projet peut gérer son projet
    if (projet.chef_projet === user.id) return true;

    return false;
  };

  // Fonction pour charger les utilisateurs disponibles
  const loadAvailableUsers = async () => {
    if (!token) return;

    setLoadingUsers(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data);
      }
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fonction pour basculer un membre
  const toggleMembre = async (userId) => {
    if (!canManageMembres()) return;

    const currentMembres = projet.membres || [];
    let newMembres;

    if (currentMembres.includes(userId)) {
      // Retirer le membre
      newMembres = currentMembres.filter((id) => id !== userId);
    } else {
      // Ajouter le membre
      newMembres = [...currentMembres, userId];
    }

    try {
      const { updateProjet } = await import('../api/projets');
      const updatedProjet = await updateProjet(token, id, { membres: newMembres });
      setProjet(updatedProjet);
      // Recharger le projet complet pour avoir les détails des membres
      loadProjet();
    } catch (err) {
      console.error("Erreur modification membres:", err);
      setError("Impossible de modifier les membres du projet");
    }
  };

  // Fonction pour supprimer le projet (réservée au super_admin)
  const handleDeleteProjet = async () => {
    if (!user || user.role !== 'super_admin') {
      alert("Seul le Super Administrateur peut supprimer des projets");
      return;
    }

    const confirmation = window.confirm(
      `⚠️ ATTENTION ⚠️\n\nVoulez-vous vraiment supprimer le projet "${projet.titre}" ?\n\nCette action est IRRÉVERSIBLE et supprimera :\n- Le projet\n- Toutes ses tâches\n- Tous ses documents\n\nTapez OK pour confirmer la suppression.`
    );

    if (!confirmation) return;

    try {
      await deleteProjet(token, id);
      alert("✓ Projet supprimé avec succès");
      navigate("/projets");
    } catch (err) {
      console.error("Erreur suppression projet:", err);
      alert("Erreur lors de la suppression du projet");
    }
  };

  // Fonction pour vérifier si l'utilisateur peut créer des tâches
  const canCreateTask = () => {
    if (!user || !projet) return false;

    // Admin et Super Admin peuvent créer
    if (user.role === 'admin' || user.role === 'super_admin') return true;

    // Créateur du projet peut créer
    if (projet.created_by === user.id) return true;

    // Chef de pôle peut créer
    if (user.role === 'chef_pole') return true;

    // Chef de projet peut créer seulement s'il a accepté
    if (projet.chef_projet === user.id && projet.chef_projet_status === 'accepted') return true;

    // Membres ne peuvent pas créer
    return false;
  };

  // Fonction pour vérifier si l'utilisateur peut modifier une tâche
  const canManageTask = (tache) => {
    if (!user || !tache || !projet) return false;

    // Admin et Super Admin peuvent tout modifier
    if (user.role === 'admin' || user.role === 'super_admin') return true;

    // Créateur du projet peut modifier toutes les tâches
    if (projet.created_by === user.id) return true;

    // Chef de pôle peut modifier les tâches
    if (user.role === 'chef_pole') return true;

    // Chef de projet peut modifier les tâches de son projet s'il a accepté
    if (projet.chef_projet === user.id && projet.chef_projet_status === 'accepted') return true;

    // Les personnes assignées ne peuvent que déplacer, pas modifier complètement
    return false;
  };

  // Fonction pour vérifier si l'utilisateur peut déplacer une tâche
  const canDragTask = (tache) => {
    if (!user || !tache) return false;

    // Admin et Super Admin peuvent tout faire
    if (user.role === 'admin' || user.role === 'super_admin') return true;

    // Créateur du projet peut déplacer les tâches
    if (projet?.created_by === user.id) return true;

    // Chef de pôle peut déplacer les tâches
    if (user.role === 'chef_pole') return true;

    // Chef de projet peut déplacer les tâches de son projet s'il a accepté
    if (projet?.chef_projet === user.id && projet?.chef_projet_status === 'accepted') return true;

    // Membre, Stagiaire, Collaborateur et Partenaire peuvent déplacer uniquement les tâches qui leur sont assignées
    if ((user.role === 'membre' || user.role === 'stagiaire' || user.role === 'collaborateur' || user.role === 'partenaire') && Array.isArray(tache.assigne_a) && tache.assigne_a.includes(user.id)) return true;

    // Personne assignée peut déplacer sa tâche (pour les autres rôles)
    if (Array.isArray(tache.assigne_a) && tache.assigne_a.includes(user.id)) return true;

    return false;
  };

  // Drag & Drop handlers
  const handleDragStart = (e, tache) => {
    if (!canDragTask(tache)) {
      e.preventDefault();
      return;
    }

    setDraggedTask(tache);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, nouveauStatut) => {
    e.preventDefault();

    if (!draggedTask) return;

    // Si le statut n'a pas changé, ne rien faire
    if (draggedTask.statut === nouveauStatut) return;

    try {
      // Mettre à jour le statut de la tâche
      await updateTache(token, draggedTask.id, {
        statut: nouveauStatut,
      });

      // Recharger le projet pour obtenir les tâches à jour
      await loadProjet();
    } catch (err) {
      console.error("Erreur update tache:", err);
      setError("Impossible de déplacer la tâche");
    }
  };

  // Handlers pour l'édition de tâches
  const handleEditTache = (tache) => {
    setEditingTache(tache);
    setShowFormTache(true);
  };

  const handleCloseFormTache = () => {
    setShowFormTache(false);
    setEditingTache(null);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          color: "#c4b5fd",
          fontSize: "1.1rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <div>Chargement du projet...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div
          style={{
            padding: "2rem",
            backgroundColor: `${"#f87171"}10`,
            border: `1px solid ${"#f87171"}`,
            borderRadius: "12px",
            color: "#f87171",
            marginBottom: "1.5rem",
          }}
        >
          <strong>Erreur :</strong> {error}
        </div>
        <Link
          to="/projets"
          style={{
            color: "#7c3aed",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = "none";
          }}
        >
          ← Retour à la liste des projets
        </Link>
      </div>
    );
  }

  if (!projet) {
    return (
      <div>
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "#2d1b69",
            borderRadius: "12px",
            border: `1px dashed ${"#4c1d95"}`,
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❓</div>
          <p style={{ color: "#c4b5fd", fontSize: "1.1rem" }}>
            Projet introuvable
          </p>
        </div>
        <Link
          to="/projets"
          style={{
            color: "#7c3aed",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = "none";
          }}
        >
          ← Retour à la liste des projets
        </Link>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Navigation */}
      <div style={{ marginBottom: "2rem" }}>
        <Link
          to="/projets"
          style={{
            color: theme.colors.secondary,
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "600",
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = "none";
          }}
        >
          ← Retour à la liste
        </Link>
      </div>

      {/* En-tête du projet */}
      <div
        style={{
          marginBottom: "2.5rem",
          backgroundColor: "#2d1b69",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 4px 16px rgba(124, 58, 237, 0.3)",
          border: `1px solid ${"#4c1d95"}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, color: "#fff", fontSize: "2rem" }}>
            {projet.titre}
          </h1>

          {/* Sélecteur de statut ou affichage du statut */}
          {canChangeStatut() ? (
            <select
              value={projet.statut}
              onChange={(e) => handleChangeStatut(e.target.value)}
              disabled={isChangingStatut}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
                backgroundColor: `${STATUT_COLORS[projet.statut] || "#c4b5fd"}20`,
                color: STATUT_COLORS[projet.statut] || "#c4b5fd",
                border: `2px solid ${STATUT_COLORS[projet.statut] || "#c4b5fd"}`,
                cursor: isChangingStatut ? "wait" : "pointer",
                outline: "none",
              }}
            >
              {getAvailableStatuts().map((statut) => (
                <option key={statut} value={statut} style={{ backgroundColor: "#2d1b69", color: "#fff" }}>
                  {STATUT_LABELS[statut]}
                </option>
              ))}
            </select>
          ) : (
            <span
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
                backgroundColor: `${STATUT_COLORS[projet.statut] || "#c4b5fd"}20`,
                color: STATUT_COLORS[projet.statut] || "#c4b5fd",
                border: `1px solid ${STATUT_COLORS[projet.statut] || "#c4b5fd"}40`,
              }}
            >
              {STATUT_LABELS[projet.statut] || projet.statut}
            </span>
          )}

          {/* Bouton de suppression - réservé au super_admin */}
          {user?.role === 'super_admin' && (
            <button
              onClick={handleDeleteProjet}
              style={{
                marginLeft: "auto",
                padding: "0.75rem 1.5rem",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                border: "2px solid #ef4444",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#ef4444";
                e.target.style.color = "#fff";
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                e.target.style.color = "#ef4444";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              🗑️ Supprimer le projet
            </button>
          )}
        </div>

        <div style={{ color: "#c4b5fd", fontSize: "0.95rem", lineHeight: "1.8" }}>
          <div style={{ marginBottom: "0.5rem" }}>
            <span style={{ marginRight: "2rem" }}>
              <strong style={{ color: "#fff" }}>📋 Type:</strong> {TYPE_LABELS[projet.type] || projet.type}
            </span>
            {projet.pole_details && (
              <span>
                <strong style={{ color: "#fff" }}>🎯 Pôle:</strong> {projet.pole_details.name}
              </span>
            )}
          </div>
          {(projet.date_debut || projet.date_fin_prevue) && (
            <div>
              {projet.date_debut && (
                <span style={{ marginRight: "2rem" }}>
                  <strong style={{ color: "#fff" }}>📅 Début:</strong> {new Date(projet.date_debut).toLocaleDateString("fr-FR")}
                </span>
              )}
              {projet.date_fin_prevue && (
                <span>
                  <strong style={{ color: "#fff" }}>🏁 Fin prévue:</strong> {new Date(projet.date_fin_prevue).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {projet.description && (
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#2d1b69",
            borderRadius: "16px",
            marginBottom: "2.5rem",
            border: `1px solid ${"#4c1d95"}`,
            boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "1rem",
              color: "#fff",
              fontSize: "1.3rem",
            }}
          >
            📝 Description
          </h3>
          <p
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              color: "#c4b5fd",
              lineHeight: "1.6",
            }}
          >
            {projet.description}
          </p>
        </div>
      )}

      {/* Équipe */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.5rem" }}>
            👥 Équipe du projet
          </h2>
          {canManageMembres() && (
            <button
              onClick={() => {
                setShowManageMembres(true);
                loadAvailableUsers();
              }}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: theme.colors.secondary,
                color: theme.text.inverse,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s",
                boxShadow: theme.shadow.md,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.orangeLight;
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = theme.shadow.lg;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.colors.secondary;
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = theme.shadow.md;
              }}
            >
              ⚙️ Gérer les membres
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {projet.client_details && (
            <div
              style={{
                padding: "1.5rem",
                backgroundColor: "#2d1b69",
                borderRadius: "12px",
                border: `1px solid ${"#4c1d95"}`,
                boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#a78bfa",
                  marginBottom: "0.75rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                👤 Client
              </div>
              <Link
                to={`/users/${projet.client_details.id}/profile`}
                style={{
                  fontWeight: "600",
                  color: "#fff",
                  marginBottom: "0.5rem",
                  fontSize: "1.1rem",
                  textDecoration: "none",
                  display: "block",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#7c3aed";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#fff";
                }}
              >
                {projet.client_details.username}
              </Link>
              <div style={{ fontSize: "0.9rem", color: "#c4b5fd" }}>{projet.client_details.email}</div>
            </div>
          )}

          {projet.chef_projet_details && (
            <div
              style={{
                padding: "1.5rem",
                backgroundColor: "#2d1b69",
                borderRadius: "12px",
                border: `1px solid ${"#4c1d95"}`,
                boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#a78bfa",
                  marginBottom: "0.75rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                🎯 Chef de projet
              </div>
              <Link
                to={`/users/${projet.chef_projet_details.id}/profile`}
                style={{
                  fontWeight: "600",
                  color: "#fff",
                  marginBottom: "0.5rem",
                  fontSize: "1.1rem",
                  textDecoration: "none",
                  display: "block",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#7c3aed";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#fff";
                }}
              >
                {projet.chef_projet_details.username}
              </Link>
              <div style={{ fontSize: "0.9rem", color: "#c4b5fd" }}>{projet.chef_projet_details.email}</div>
            </div>
          )}
        </div>

        {projet.membres_details && projet.membres_details.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h3
              style={{
                color: "#fff",
                marginBottom: "1rem",
                fontSize: "1.2rem",
              }}
            >
              Membres de l'équipe ({projet.membres_details.length})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {projet.membres_details.map((membre) => (
                <Link
                  key={membre.id}
                  to={`/users/${membre.id}/profile`}
                  style={{
                    padding: "1rem",
                    backgroundColor: "#1e1b4b",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    border: `1px solid ${"#4c1d95"}`,
                    transition: "all 0.2s",
                    textDecoration: "none",
                    display: "block",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#4c1d95";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#1e1b4b";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ fontWeight: "600", color: "#fff", marginBottom: "0.25rem" }}>
                    {membre.username}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#c4b5fd" }}>{membre.role}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tâches - Vue Kanban */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.5rem" }}>
            📊 Kanban - Tâches du projet ({projet.taches?.length || 0})
          </h2>
          {canCreateTask() && (
            <button
              onClick={() => setShowFormTache(true)}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: theme.colors.secondary,
                color: theme.text.inverse,
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.2s",
                boxShadow: theme.shadow.md,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.colors.orangeLight;
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = theme.shadow.lg;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.colors.secondary;
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = theme.shadow.md;
              }}
            >
              + Nouvelle tâche
            </button>
          )}
        </div>

        {!projet.taches || projet.taches.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: "#2d1b69",
              borderRadius: "12px",
              border: `1px dashed ${"#4c1d95"}`,
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <p style={{ color: "#c4b5fd", margin: 0 }}>
              Aucune tâche pour ce projet. Commencez par en créer une !
            </p>
          </div>
        ) : (
          <>
            {/* Statistiques */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {[
                { id: "a_faire", label: "À faire", icon: "📝", color: "#a78bfa" },
                { id: "en_cours", label: "En cours", icon: "⚡", color: "#7c3aed" },
                { id: "termine", label: "Terminé", icon: "✓", color: "#10b981" },
              ].map((col) => {
                const count = projet.taches.filter((t) => t.statut === col.id).length;
                return (
                  <div
                    key={col.id}
                    style={{
                      backgroundColor: "#2d1b69",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      border: "1px solid #4c1d95",
                      transition: "all 0.2s",
                      boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "10px",
                          backgroundColor: `${col.color}33`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                        }}
                      >
                        {col.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.85rem", color: "#c4b5fd", fontWeight: "500", marginBottom: "0.25rem" }}>
                          {col.label}
                        </div>
                        <div style={{ fontSize: "2rem", fontWeight: "700", color: "#fff", lineHeight: 1 }}>
                          {count}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Board Kanban */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1.5rem",
                minHeight: "400px",
              }}
            >
              {[
                { id: "a_faire", label: "À faire", color: "#a78bfa" },
                { id: "en_cours", label: "En cours", color: "#7c3aed" },
                { id: "termine", label: "Terminé", color: "#10b981" },
              ].map((colonne) => {
                const tachesColonne = projet.taches.filter((t) => t.statut === colonne.id);
                return (
                  <div
                    key={colonne.id}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, colonne.id)}
                    style={{
                      backgroundColor: "#2d1b69",
                      borderRadius: "16px",
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      border: "1px solid #4c1d95",
                    }}
                  >
                    {/* En-tête de colonne */}
                    <div
                      style={{
                        backgroundColor: colonne.color,
                        color: "#fff",
                        padding: "1rem 1.25rem",
                        borderRadius: "12px",
                        marginBottom: "1.5rem",
                        fontWeight: "700",
                        fontSize: "1.05rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <span>{colonne.label}</span>
                      <span
                        style={{
                          backgroundColor: "rgba(255,255,255,0.25)",
                          padding: "0.4rem 0.75rem",
                          borderRadius: "20px",
                          fontSize: "0.9rem",
                          fontWeight: "700",
                        }}
                      >
                        {tachesColonne.length}
                      </span>
                    </div>

                    {/* Liste des tâches */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {tachesColonne.length === 0 ? (
                        <div
                          style={{
                            padding: "2rem 1rem",
                            textAlign: "center",
                            color: "#a78bfa",
                            fontSize: "0.9rem",
                            border: "2px dashed #4c1d95",
                            borderRadius: "12px",
                            backgroundColor: "rgba(76, 29, 149, 0.2)",
                          }}
                        >
                          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
                          <div>Aucune tâche</div>
                        </div>
                      ) : (
                        tachesColonne.map((tache) => {
                          const isDraggable = canDragTask(tache);
                          return (
                            <div
                              key={tache.id}
                              draggable={isDraggable}
                              onDragStart={(e) => handleDragStart(e, tache)}
                              onDragEnd={handleDragEnd}
                              style={{
                                backgroundColor: "#1e1b4b",
                                padding: "1.25rem",
                                borderRadius: "12px",
                                boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
                                cursor: isDraggable ? "grab" : "default",
                                border: "1px solid #4c1d95",
                                transition: "all 0.2s",
                                opacity: isDraggable ? 1 : 0.7,
                              }}
                              onMouseEnter={(e) => {
                                if (isDraggable) {
                                  e.currentTarget.style.transform = "translateY(-3px)";
                                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
                                  e.currentTarget.style.borderColor = "#a78bfa";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (isDraggable) {
                                  e.currentTarget.style.transform = "translateY(0)";
                                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
                                  e.currentTarget.style.borderColor = "#4c1d95";
                                }
                              }}
                            >
                              {/* Titre de la tâche */}
                              <div
                                style={{
                                  fontWeight: "600",
                                  marginBottom: "0.75rem",
                                  fontSize: "1.05rem",
                                  color: "#fff",
                                  lineHeight: "1.4",
                                }}
                              >
                                {tache.titre}
                              </div>

                              {/* Badge priorité */}
                              <div style={{ marginBottom: "0.75rem" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "0.4rem 0.75rem",
                                    borderRadius: "8px",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    backgroundColor: `${PRIORITE_COLORS[tache.priorite] || "#a78bfa"}33`,
                                    color: PRIORITE_COLORS[tache.priorite] || "#a78bfa",
                                    border: `1px solid ${PRIORITE_COLORS[tache.priorite] || "#a78bfa"}`,
                                  }}
                                >
                                  {TACHE_PRIORITE_LABELS[tache.priorite] || tache.priorite}
                                </span>
                              </div>

                              {/* Informations supplémentaires */}
                              <div style={{ fontSize: "0.9rem", color: "#c4b5fd", lineHeight: "1.6" }}>
                                {tache.assigne_a_details && Array.isArray(tache.assigne_a_details) && tache.assigne_a_details.length > 0 && (
                                  <div style={{ marginBottom: "0.5rem" }}>
                                    👤 {tache.assigne_a_details.map(user => user.username).join(", ")}
                                  </div>
                                )}
                                {tache.deadline && (
                                  <div>📅 {new Date(tache.deadline).toLocaleDateString("fr-FR")}</div>
                                )}
                              </div>

                              {/* Bouton d'édition si l'utilisateur peut modifier */}
                              {canManageTask(tache) && (
                                <div style={{ marginTop: "0.75rem" }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTache(tache);
                                    }}
                                    style={{
                                      padding: "0.5rem 1rem",
                                      backgroundColor: "#7c3aed",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "8px",
                                      fontSize: "0.85rem",
                                      fontWeight: "600",
                                      cursor: "pointer",
                                      transition: "all 0.2s",
                                      width: "100%",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = "#6d28d9";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = "#7c3aed";
                                    }}
                                  >
                                    ✏️ Modifier
                                  </button>
                                </div>
                              )}

                              {/* Indicateur si non draggable */}
                              {!isDraggable && (
                                <div style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#a78bfa", fontStyle: "italic" }}>
                                  🔒 Lecture seule
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                backgroundColor: "rgba(124, 58, 237, 0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                color: "#c4b5fd",
                fontSize: "0.9rem",
              }}
            >
              💡 <strong>Astuce:</strong> Glissez-déposez les tâches pour changer leur statut. Les administrateurs, super administrateurs, créateurs de projet, chefs de pôle et chefs de projet peuvent modifier complètement les tâches. Les personnes assignées peuvent déplacer leurs tâches.
            </div>
          </>
        )}
      </div>

      {/* Documents */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.5rem" }}>
            📄 Documents ({projet.documents?.length || 0})
          </h2>
          <button
            onClick={() => setShowUploadDoc(true)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: theme.colors.secondary,
              color: theme.text.inverse,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.2s",
              boxShadow: theme.shadow.md,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.orangeLight;
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = theme.shadow.lg;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.secondary;
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = theme.shadow.md;
            }}
          >
            + Uploader un document
          </button>
        </div>
        {!projet.documents || projet.documents.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: "#2d1b69",
              borderRadius: "12px",
              border: `1px dashed ${"#4c1d95"}`,
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📁</div>
            <p style={{ color: "#c4b5fd", margin: 0 }}>
              Aucun document pour ce projet.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {projet.documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: "1.5rem",
                  backgroundColor: "#2d1b69",
                  borderRadius: "12px",
                  border: `1px solid ${"#4c1d95"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.75rem",
                      color: "#fff",
                      fontSize: "1.05rem",
                    }}
                  >
                    📎 {doc.titre}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#c4b5fd", marginBottom: "0.5rem" }}>
                    Type: <strong>{doc.type}</strong> · Uploadé par{" "}
                    <strong>{doc.uploade_par_details?.username || "—"}</strong> le{" "}
                    {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </div>
                  {doc.description && (
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#a78bfa",
                        marginTop: "0.5rem",
                        paddingTop: "0.5rem",
                        borderTop: `1px solid ${"#4c1d95"}`,
                      }}
                    >
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
                      padding: "0.75rem 1.5rem",
                      backgroundColor: theme.colors.secondary,
                      color: theme.text.inverse,
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      marginLeft: "1.5rem",
                      transition: "all 0.2s",
                      boxShadow: theme.shadow.md,
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = theme.colors.orangeLight;
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = theme.shadow.lg;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = theme.colors.secondary;
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = theme.shadow.md;
                    }}
                  >
                    ⬇ Télécharger
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
            padding: "2rem",
            backgroundColor: `${"#7c3aed"}10`,
            borderRadius: "12px",
            borderLeft: `4px solid ${"#7c3aed"}`,
            border: `1px solid ${"#7c3aed"}40`,
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "1rem",
              color: "#fff",
              fontSize: "1.3rem",
            }}
          >
            🔗 Informations Odoo
          </h3>
          {projet.odoo_project_id && (
            <div style={{ marginBottom: "0.75rem", color: "#c4b5fd" }}>
              <strong style={{ color: "#fff" }}>ID Projet Odoo:</strong> {projet.odoo_project_id}
            </div>
          )}
          {projet.odoo_invoice_id && (
            <div style={{ color: "#c4b5fd" }}>
              <strong style={{ color: "#fff" }}>ID Facture Odoo:</strong> {projet.odoo_invoice_id}
            </div>
          )}
        </div>
      )}

      {/* Modal Gestion des Membres */}
      {showManageMembres && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowManageMembres(false)}
        >
          <div
            style={{
              backgroundColor: "#1e1b4b",
              padding: "2rem",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              border: "1px solid #4c1d95",
              boxShadow: "0 10px 40px rgba(124, 58, 237, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, color: "#fff", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
              ⚙️ Gérer les membres du projet
            </h3>

            {loadingUsers ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#c4b5fd" }}>
                Chargement des utilisateurs...
              </div>
            ) : (
              <div>
                <p style={{ color: "#c4b5fd", marginBottom: "1rem" }}>
                  Cliquez sur les utilisateurs pour les ajouter ou retirer du projet :
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {availableUsers.map((utilisateur) => {
                    const isMembre = projet.membres?.includes(utilisateur.id);
                    return (
                      <div
                        key={utilisateur.id}
                        onClick={() => toggleMembre(utilisateur.id)}
                        style={{
                          padding: "1rem",
                          backgroundColor: isMembre ? "#4c1d95" : "#2d1b69",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          border: isMembre ? "2px solid #7c3aed" : "1px solid #4c1d95",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#4c1d95";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isMembre ? "#4c1d95" : "#2d1b69";
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "600", color: "#fff", marginBottom: "0.25rem" }}>
                            {utilisateur.username}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#c4b5fd" }}>
                            {utilisateur.role} {utilisateur.pole_name && `• ${utilisateur.pole_name}`}
                          </div>
                        </div>
                        {isMembre && (
                          <div style={{ fontSize: "1.5rem" }}>✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginTop: "2rem", textAlign: "right" }}>
              <button
                onClick={() => setShowManageMembres(false)}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: theme.colors.secondary,
                  color: theme.text.inverse,
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.orangeLight;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.colors.secondary;
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <FormTache
        isOpen={showFormTache}
        onClose={handleCloseFormTache}
        tache={editingTache}
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
