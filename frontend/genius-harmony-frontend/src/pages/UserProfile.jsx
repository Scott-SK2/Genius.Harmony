import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useResponsive } from "../hooks/useResponsive";
import { API_BASE_URL } from "../config";

const ROLE_LABELS = {
  super_admin: "Super Administrateur",
  admin: "Administrateur",
  chef_pole: "Chef de Pôle",
  membre: "Membre",
  stagiaire: "Stagiaire",
  collaborateur: "Collaborateur",
  artiste: "Artiste",
  client: "Client",
  partenaire: "Partenaire",
};

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

const STATUT_PROJET_LABELS = {
  brouillon: "Brouillon",
  en_attente: "En attente",
  en_cours: "En cours",
  en_revision: "En révision",
  termine: "Terminé",
  annule: "Annulé",
};

const STATUT_TACHE_LABELS = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
};

const PRIORITE_LABELS = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

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

export default function UserProfile() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const { isMobile, isTablet, isSmallScreen } = useResponsive();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const canUploadPhoto = () => {
    if (!user || !id) return false;
    return user.id === parseInt(id) || user.role === 'admin' || user.role === 'super_admin';
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      alert("Veuillez sélectionner une image valide");
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setUploadingPhoto(true);
      const response = await fetch(`${API_BASE_URL}/api/users/${id}/upload-photo/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Impossible d'uploader la photo");
      }

      // Recharger le profil pour afficher la nouvelle photo
      fetchUserProfile();
    } catch (err) {
      console.error("Erreur upload photo:", err);
      alert("Impossible d'uploader la photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users/${id}/profile/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de charger le profil");
      }

      const data = await response.json();
      setUserProfile(data);
    } catch (err) {
      console.error("Erreur fetch profil utilisateur:", err);
      setError("Impossible de charger le profil utilisateur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !id) return;
    fetchUserProfile();
  }, [token, id]);

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
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <div style={{ color: "#c4b5fd" }}>Chargement du profil...</div>
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
            backgroundColor: "rgba(248, 113, 113, 0.1)",
            border: "1px solid #f87171",
            borderRadius: "12px",
            color: "#f87171",
            marginBottom: "1.5rem",
          }}
        >
          <strong>Erreur :</strong> {error}
        </div>
        <Link
          to="/admin/users"
          style={{
            color: "#7c3aed",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500",
          }}
        >
          ← Retour à la liste des utilisateurs
        </Link>
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <div style={{ width: "100%" }}>
      {/* Navigation */}
      <div style={{ marginBottom: isMobile ? "1.5rem" : "2rem", display: "flex", flexDirection: isSmallScreen ? "column" : "row", gap: isSmallScreen ? "1rem" : "0", justifyContent: "space-between", alignItems: isSmallScreen ? "flex-start" : "center" }}>
        <Link
          to="/admin/users"
          style={{
            color: theme.colors.primary,
            textDecoration: "none",
            fontSize: isMobile ? "0.9rem" : "1rem",
            fontWeight: "600",
          }}
          onMouseEnter={(e) => {
            e.target.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.target.style.textDecoration = "none";
          }}
        >
          ← Retour à la liste des utilisateurs
        </Link>

        {canUploadPhoto() && (
          <Link
            to={`/users/${id}/edit`}
            style={{
              padding: isMobile ? "0.5rem 1rem" : "0.6rem 1.2rem",
              backgroundColor: theme.colors.secondary,
              color: theme.text.inverse,
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: isMobile ? "0.85rem" : "0.95rem",
              fontWeight: "600",
              transition: "all 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme.colors.accent;
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = theme.shadow.md;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = theme.colors.secondary;
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            ✏️ Modifier le profil
          </Link>
        )}
      </div>

      {/* En-tête du profil */}
      <div
        style={{
          marginBottom: isMobile ? "1.5rem" : "2.5rem",
          backgroundColor: theme.bg.tertiary,
          padding: isMobile ? "1.25rem" : "2rem",
          borderRadius: isMobile ? "12px" : "16px",
          boxShadow: theme.shadow.lg,
          border: `1px solid ${theme.border.light}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "1rem" : "2rem", marginBottom: isMobile ? "1rem" : "1.5rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: isMobile ? "60px" : "80px",
                height: isMobile ? "60px" : "80px",
                borderRadius: "50%",
                backgroundColor: theme.colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                overflow: "hidden",
                border: `3px solid ${theme.colors.secondary}`,
              }}
            >
              {userProfile.photo_url ? (
                <img
                  src={userProfile.photo_url}
                  alt={userProfile.username}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                "👤"
              )}
            </div>
            {canUploadPhoto() && (
              <label
                htmlFor="photo-upload"
                style={{
                  position: "absolute",
                  bottom: "-5px",
                  right: "-5px",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  backgroundColor: theme.colors.secondary,
                  border: `2px solid ${theme.bg.tertiary}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: uploadingPhoto ? "wait" : "pointer",
                  transition: "all 0.2s",
                  fontSize: "0.9rem",
                }}
                onMouseEnter={(e) => {
                  if (!uploadingPhoto) {
                    e.target.style.transform = "scale(1.1)";
                    e.target.style.backgroundColor = theme.colors.accent;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!uploadingPhoto) {
                    e.target.style.transform = "scale(1)";
                    e.target.style.backgroundColor = theme.colors.secondary;
                  }
                }}
              >
                {uploadingPhoto ? "⏳" : "📷"}
              </label>
            )}
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto || !canUploadPhoto()}
              style={{ display: "none" }}
            />
          </div>
          <div>
            <h1 style={{ margin: 0, color: theme.text.primary, fontSize: isMobile ? "1.5rem" : "2rem" }}>
              {userProfile.username}
            </h1>
            <div style={{ color: theme.text.secondary, fontSize: isMobile ? "0.9rem" : "1.1rem", marginTop: "0.5rem" }}>
              {ROLE_LABELS[userProfile.role] || userProfile.role}
              {(userProfile.role === 'membre' || userProfile.role === 'chef_pole') && userProfile.membre_specialite &&
                ` (${SPECIALITE_LABELS[userProfile.membre_specialite] || userProfile.membre_specialite})`}
              {userProfile.pole_name && ` • ${userProfile.pole_name}`}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
            gap: isMobile ? "1rem" : "1.5rem",
            marginTop: isMobile ? "1rem" : "1.5rem",
            paddingTop: isMobile ? "1rem" : "1.5rem",
            borderTop: `1px solid ${theme.border.medium}`,
          }}
        >
          <div>
            <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: theme.text.tertiary, marginBottom: "0.5rem" }}>
              Email
            </div>
            <div style={{ color: theme.text.primary, fontSize: isMobile ? "0.9rem" : "1rem", wordBreak: "break-word" }}>{userProfile.email}</div>
          </div>
          {userProfile.first_name && (
            <div>
              <div style={{ fontSize: "0.85rem", color: theme.text.tertiary, marginBottom: "0.5rem" }}>
                Prénom
              </div>
              <div style={{ color: theme.text.primary, fontSize: "1rem" }}>{userProfile.first_name}</div>
            </div>
          )}
          {userProfile.last_name && (
            <div>
              <div style={{ fontSize: "0.85rem", color: theme.text.tertiary, marginBottom: "0.5rem" }}>
                Nom
              </div>
              <div style={{ color: theme.text.primary, fontSize: "1rem" }}>{userProfile.last_name}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: "0.85rem", color: theme.text.tertiary, marginBottom: "0.5rem" }}>
              Membre depuis
            </div>
            <div style={{ color: theme.text.primary, fontSize: "1rem" }}>
              {new Date(userProfile.date_joined).toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>

        {/* Description */}
        {userProfile.description && (
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: `1px solid ${theme.border.medium}`,
            }}
          >
            <div style={{ fontSize: "0.85rem", color: theme.colors.secondary, marginBottom: "0.5rem", fontWeight: "600" }}>
              Description
            </div>
            <div style={{ color: theme.text.primary, fontSize: "1rem", lineHeight: "1.6" }}>
              {userProfile.description}
            </div>
          </div>
        )}

        {/* Informations de contact */}
        {(userProfile.phone || userProfile.website || userProfile.instagram || userProfile.twitter || userProfile.tiktok) && (
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: `1px solid ${theme.border.medium}`,
            }}
          >
            <div style={{ fontSize: "0.85rem", color: theme.colors.secondary, marginBottom: "1rem", fontWeight: "600" }}>
              📞 Informations de contact
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))",
                gap: isMobile ? "0.75rem" : "1rem",
              }}
            >
              {userProfile.phone && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: theme.bg.secondary,
                    borderRadius: "8px",
                    border: `1px solid ${theme.border.light}`,
                  }}
                >
                  <div style={{ fontSize: "1.5rem" }}>📱</div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: theme.text.tertiary, marginBottom: "0.25rem" }}>
                      Téléphone
                    </div>
                    <a
                      href={`tel:${userProfile.phone}`}
                      style={{
                        color: theme.colors.secondary,
                        textDecoration: "none",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                    >
                      {userProfile.phone}
                    </a>
                  </div>
                </div>
              )}
              {userProfile.website && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: theme.bg.secondary,
                    borderRadius: "8px",
                    border: `1px solid ${theme.border.light}`,
                  }}
                >
                  <div style={{ fontSize: "1.5rem" }}>🌐</div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: theme.text.tertiary, marginBottom: "0.25rem" }}>
                      Site web
                    </div>
                    <a
                      href={userProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: theme.colors.secondary,
                        textDecoration: "none",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                    >
                      Visiter
                    </a>
                  </div>
                </div>
              )}
              {userProfile.instagram && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: theme.bg.secondary,
                    borderRadius: "8px",
                    border: `1px solid ${theme.border.light}`,
                  }}
                >
                  <div style={{ fontSize: "1.5rem" }}>📸</div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: theme.text.tertiary, marginBottom: "0.25rem" }}>
                      Instagram
                    </div>
                    <a
                      href={userProfile.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: theme.colors.secondary,
                        textDecoration: "none",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                    >
                      Suivre
                    </a>
                  </div>
                </div>
              )}
              {userProfile.twitter && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: theme.bg.secondary,
                    borderRadius: "8px",
                    border: `1px solid ${theme.border.light}`,
                  }}
                >
                  <div style={{ fontSize: "1.5rem" }}>🐦</div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: theme.text.tertiary, marginBottom: "0.25rem" }}>
                      Twitter / X
                    </div>
                    <a
                      href={userProfile.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: theme.colors.secondary,
                        textDecoration: "none",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                    >
                      Suivre
                    </a>
                  </div>
                </div>
              )}
              {userProfile.tiktok && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem",
                    backgroundColor: theme.bg.secondary,
                    borderRadius: "8px",
                    border: `1px solid ${theme.border.light}`,
                  }}
                >
                  <div style={{ fontSize: "1.5rem" }}>🎵</div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: theme.text.tertiary, marginBottom: "0.25rem" }}>
                      TikTok
                    </div>
                    <a
                      href={userProfile.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: theme.colors.secondary,
                        textDecoration: "none",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                    >
                      Suivre
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
          gap: isMobile ? "1rem" : "1.5rem",
          marginBottom: isMobile ? "1.5rem" : "2.5rem",
        }}
      >
        {[
          { label: "Projets (Client)", value: userProfile.stats.total_projets_client, icon: "👤", color: "#7c3aed", link: "/projets" },
          { label: "Projets (Chef)", value: userProfile.stats.total_projets_chef, icon: "🎯", color: "#a78bfa", link: "/projets" },
          { label: "Projets (Membre)", value: userProfile.stats.total_projets_membre, icon: "👥", color: "#c4b5fd", link: "/projets" },
          { label: "Projets créés", value: userProfile.stats.total_projets_crees, icon: "✨", color: "#10b981", link: "/projets" },
          { label: "Tâches assignées", value: userProfile.stats.total_taches_assignees, icon: "📋", color: "#f59e0b", link: "/taches/kanban" },
        ].map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            style={{
              backgroundColor: "#2d1b69",
              borderRadius: "12px",
              padding: isMobile ? "1rem" : "1.5rem",
              border: "1px solid #4c1d95",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
              textDecoration: "none",
              display: "block",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
              e.currentTarget.style.borderColor = stat.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
              e.currentTarget.style.borderColor = "#4c1d95";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: isMobile ? "40px" : "50px",
                  height: isMobile ? "40px" : "50px",
                  borderRadius: "10px",
                  backgroundColor: `${stat.color}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "1.2rem" : "1.5rem",
                }}
              >
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: "#c4b5fd", marginBottom: "0.25rem" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: isMobile ? "1.5rem" : "2rem", fontWeight: "700", color: "#fff", lineHeight: 1 }}>
                  {stat.value}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tâches assignées */}
      <div style={{ marginBottom: isMobile ? "1.5rem" : "2.5rem" }}>
        <h2 style={{ margin: 0, marginBottom: isMobile ? "1rem" : "1.5rem", color: "#fff", fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
          📋 Tâches assignées ({userProfile.taches_assignees.length})
        </h2>

        {userProfile.taches_assignees.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              backgroundColor: "#2d1b69",
              borderRadius: "12px",
              border: "1px dashed #4c1d95",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
            <p style={{ color: "#c4b5fd", margin: 0 }}>Aucune tâche assignée</p>
          </div>
        ) : (
          <>
            {/* Statistiques des tâches */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(3, 1fr)",
                gap: isMobile ? "0.75rem" : "1rem",
                marginBottom: isMobile ? "1rem" : "1.5rem",
              }}
            >
              {[
                { label: "À faire", value: userProfile.stats.taches_a_faire, color: "#a78bfa" },
                { label: "En cours", value: userProfile.stats.taches_en_cours, color: "#7c3aed" },
                { label: "Terminées", value: userProfile.stats.taches_terminees, color: "#10b981" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    backgroundColor: "#2d1b69",
                    borderRadius: "8px",
                    padding: isMobile ? "0.75rem" : "1rem",
                    border: "1px solid #4c1d95",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: isMobile ? "1.2rem" : "1.5rem", fontWeight: "700", color: stat.color }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: isMobile ? "0.75rem" : "0.85rem", color: "#c4b5fd", marginTop: "0.25rem" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Liste des tâches */}
            <div style={{ display: "grid", gap: "1rem" }}>
              {userProfile.taches_assignees.map((tache) => (
                <div
                  key={tache.id}
                  style={{
                    backgroundColor: "#2d1b69",
                    borderRadius: "12px",
                    padding: isMobile ? "1rem" : "1.5rem",
                    border: "1px solid #4c1d95",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
                  }}
                >
                  <div style={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", justifyContent: "space-between", alignItems: isSmallScreen ? "flex-start" : "start", gap: isSmallScreen ? "0.75rem" : "0", marginBottom: isMobile ? "0.75rem" : "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: "#fff", fontSize: isMobile ? "1rem" : "1.1rem", marginBottom: "0.5rem" }}>
                        {tache.titre}
                      </h3>
                      {tache.projet_details && (
                        <Link
                          to={`/projets/${tache.projet}`}
                          style={{
                            color: "#a78bfa",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.textDecoration = "none";
                          }}
                        >
                          📁 {tache.projet_details.titre}
                        </Link>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", gap: isMobile ? "0.5rem" : "0.5rem", alignItems: isSmallScreen ? "flex-start" : "center" }}>
                      <span
                        style={{
                          padding: isMobile ? "0.3rem 0.6rem" : "0.4rem 0.75rem",
                          borderRadius: "6px",
                          fontSize: isMobile ? "0.75rem" : "0.85rem",
                          fontWeight: "600",
                          backgroundColor: `${PRIORITE_COLORS[tache.priorite]}33`,
                          color: PRIORITE_COLORS[tache.priorite],
                          border: `1px solid ${PRIORITE_COLORS[tache.priorite]}`,
                        }}
                      >
                        {PRIORITE_LABELS[tache.priorite]}
                      </span>
                      <span
                        style={{
                          padding: isMobile ? "0.3rem 0.6rem" : "0.4rem 0.75rem",
                          borderRadius: "6px",
                          fontSize: isMobile ? "0.75rem" : "0.85rem",
                          fontWeight: "600",
                          color: "#c4b5fd",
                        }}
                      >
                        {STATUT_TACHE_LABELS[tache.statut]}
                      </span>
                    </div>
                  </div>
                  {tache.deadline && (
                    <div style={{ fontSize: "0.9rem", color: "#c4b5fd" }}>
                      📅 Deadline: {new Date(tache.deadline).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Projets en tant que client */}
      {userProfile.projets_client.length > 0 && (
        <div style={{ marginBottom: isMobile ? "1.5rem" : "2.5rem" }}>
          <h2 style={{ margin: 0, marginBottom: isMobile ? "1rem" : "1.5rem", color: "#fff", fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
            👤 Projets (Client) ({userProfile.projets_client.length})
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {userProfile.projets_client.map((projet) => (
              <Link
                key={projet.id}
                to={`/projets/${projet.id}`}
                style={{
                  backgroundColor: "#2d1b69",
                  borderRadius: "12px",
                  padding: isMobile ? "1rem" : "1.5rem",
                  border: "1px solid #4c1d95",
                  textDecoration: "none",
                  display: "block",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", justifyContent: "space-between", alignItems: isSmallScreen ? "flex-start" : "start", gap: isSmallScreen ? "0.75rem" : "0" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: "#fff", fontSize: isMobile ? "1rem" : "1.1rem", marginBottom: "0.5rem" }}>
                      {projet.titre}
                    </h3>
                    {projet.pole_details && (
                      <div style={{ color: "#c4b5fd", fontSize: isMobile ? "0.85rem" : "0.9rem" }}>
                        🎯 {projet.pole_details.name}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      padding: isMobile ? "0.3rem 0.6rem" : "0.4rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: isMobile ? "0.75rem" : "0.85rem",
                      fontWeight: "600",
                      backgroundColor: `${STATUT_COLORS[projet.statut]}33`,
                      color: STATUT_COLORS[projet.statut],
                      border: `1px solid ${STATUT_COLORS[projet.statut]}`,
                      alignSelf: isSmallScreen ? "flex-start" : "auto",
                    }}
                  >
                    {STATUT_PROJET_LABELS[projet.statut]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Projets en tant que chef */}
      {userProfile.projets_chef.length > 0 && (
        <div style={{ marginBottom: isMobile ? "1.5rem" : "2.5rem" }}>
          <h2 style={{ margin: 0, marginBottom: isMobile ? "1rem" : "1.5rem", color: "#fff", fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
            🎯 Projets (Chef de projet) ({userProfile.projets_chef.length})
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {userProfile.projets_chef.map((projet) => (
              <Link
                key={projet.id}
                to={`/projets/${projet.id}`}
                style={{
                  backgroundColor: "#2d1b69",
                  borderRadius: "12px",
                  padding: isMobile ? "1rem" : "1.5rem",
                  border: "1px solid #4c1d95",
                  textDecoration: "none",
                  display: "block",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", justifyContent: "space-between", alignItems: isSmallScreen ? "flex-start" : "start", gap: isSmallScreen ? "0.75rem" : "0" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: "#fff", fontSize: isMobile ? "1rem" : "1.1rem", marginBottom: "0.5rem" }}>
                      {projet.titre}
                    </h3>
                    {projet.pole_details && (
                      <div style={{ color: "#c4b5fd", fontSize: isMobile ? "0.85rem" : "0.9rem" }}>
                        🎯 {projet.pole_details.name}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      padding: isMobile ? "0.3rem 0.6rem" : "0.4rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: isMobile ? "0.75rem" : "0.85rem",
                      fontWeight: "600",
                      backgroundColor: `${STATUT_COLORS[projet.statut]}33`,
                      color: STATUT_COLORS[projet.statut],
                      border: `1px solid ${STATUT_COLORS[projet.statut]}`,
                      alignSelf: isSmallScreen ? "flex-start" : "auto",
                    }}
                  >
                    {STATUT_PROJET_LABELS[projet.statut]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Projets en tant que membre */}
      {userProfile.projets_membre.length > 0 && (
        <div style={{ marginBottom: isMobile ? "1.5rem" : "2.5rem" }}>
          <h2 style={{ margin: 0, marginBottom: isMobile ? "1rem" : "1.5rem", color: "#fff", fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
            👥 Projets (Membre d'équipe) ({userProfile.projets_membre.length})
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {userProfile.projets_membre.map((projet) => (
              <Link
                key={projet.id}
                to={`/projets/${projet.id}`}
                style={{
                  backgroundColor: "#2d1b69",
                  borderRadius: "12px",
                  padding: isMobile ? "1rem" : "1.5rem",
                  border: "1px solid #4c1d95",
                  textDecoration: "none",
                  display: "block",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", justifyContent: "space-between", alignItems: isSmallScreen ? "flex-start" : "start", gap: isSmallScreen ? "0.75rem" : "0" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: "#fff", fontSize: isMobile ? "1rem" : "1.1rem", marginBottom: "0.5rem" }}>
                      {projet.titre}
                    </h3>
                    {projet.pole_details && (
                      <div style={{ color: "#c4b5fd", fontSize: isMobile ? "0.85rem" : "0.9rem" }}>
                        🎯 {projet.pole_details.name}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      padding: isMobile ? "0.3rem 0.6rem" : "0.4rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: isMobile ? "0.75rem" : "0.85rem",
                      fontWeight: "600",
                      backgroundColor: `${STATUT_COLORS[projet.statut]}33`,
                      color: STATUT_COLORS[projet.statut],
                      border: `1px solid ${STATUT_COLORS[projet.statut]}`,
                      alignSelf: isSmallScreen ? "flex-start" : "auto",
                    }}
                  >
                    {STATUT_PROJET_LABELS[projet.statut]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Projets créés */}
      {userProfile.projets_crees.length > 0 && (
        <div style={{ marginBottom: isMobile ? "1.5rem" : "2.5rem" }}>
          <h2 style={{ margin: 0, marginBottom: isMobile ? "1rem" : "1.5rem", color: "#fff", fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
            ✨ Projets créés ({userProfile.projets_crees.length})
          </h2>
          <div style={{ display: "grid", gap: "1rem" }}>
            {userProfile.projets_crees.map((projet) => (
              <Link
                key={projet.id}
                to={`/projets/${projet.id}`}
                style={{
                  backgroundColor: "#2d1b69",
                  borderRadius: "12px",
                  padding: isMobile ? "1rem" : "1.5rem",
                  border: "1px solid #4c1d95",
                  textDecoration: "none",
                  display: "block",
                  transition: "all 0.2s",
                  boxShadow: "0 2px 8px rgba(124, 58, 237, 0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.1)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", justifyContent: "space-between", alignItems: isSmallScreen ? "flex-start" : "start", gap: isSmallScreen ? "0.75rem" : "0" }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: "#fff", fontSize: isMobile ? "1rem" : "1.1rem", marginBottom: "0.5rem" }}>
                      {projet.titre}
                    </h3>
                    {projet.pole_details && (
                      <div style={{ color: "#c4b5fd", fontSize: isMobile ? "0.85rem" : "0.9rem" }}>
                        🎯 {projet.pole_details.name}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      padding: isMobile ? "0.3rem 0.6rem" : "0.4rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: isMobile ? "0.75rem" : "0.85rem",
                      fontWeight: "600",
                      backgroundColor: `${STATUT_COLORS[projet.statut]}33`,
                      color: STATUT_COLORS[projet.statut],
                      border: `1px solid ${STATUT_COLORS[projet.statut]}`,
                      alignSelf: isSmallScreen ? "flex-start" : "auto",
                    }}
                  >
                    {STATUT_PROJET_LABELS[projet.statut]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
