/**
 * Constants used throughout the application
 * Centralized to avoid duplication and ensure consistency
 */

// Projet types
export const TYPE_LABELS = {
  film: "Film",
  court_metrage: "Court métrage",
  web_serie: "Web série",
  event: "Event",
  atelier_animation: "Atelier/Animation",
  musique: "Musique",
  autre: "Autre",
};

// Projet statuts
export const STATUT_LABELS = {
  brouillon: "Brouillon",
  en_attente: "En attente",
  en_cours: "En cours",
  en_revision: "En révision",
  termine: "Terminé",
  annule: "Annulé",
};

// Tache statuts
export const TACHE_STATUT_LABELS = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
};

// Tache priorités
export const TACHE_PRIORITE_LABELS = {
  basse: "Basse",
  normale: "Normale",
  haute: "Haute",
  urgente: "Urgente",
};

// Status colors
export const STATUT_COLORS = {
  brouillon: "#c4b5fd",
  en_attente: "#f59e0b",
  en_cours: "#7c3aed",
  en_revision: "#a78bfa",
  termine: "#10b981",
  annule: "#f87171",
};

// Priority colors
export const PRIORITE_COLORS = {
  basse: "#c4b5fd",
  normale: "#7c3aed",
  haute: "#f59e0b",
  urgente: "#f87171",
};

// Document types
export const DOCUMENT_TYPE_LABELS = {
  scenario: "Scénario",
  contrat: "Contrat",
  budget: "Budget",
  planning: "Planning",
  brief: "Brief",
  moodboard: "Moodboard",
  rush_footage: "Rush/Footage",
  montage: "Montage",
  export_final: "Export final",
  media: "Media",
  presskit: "Presskit",
  autre: "Autre",
};

// User roles
export const ROLE_LABELS = {
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

// Membre specialités
export const SPECIALITE_LABELS = {
  musicien: "Musicien",
  manager: "Manager",
  photographe: "Photographe",
  videaste: "Vidéaste",
  monteur: "Monteur",
  graphiste: "Graphiste",
  developpeur: "Développeur",
  redacteur: "Rédacteur",
  autre: "Autre",
};

// Client types
export const CLIENT_TYPE_LABELS = {
  entreprise: "Entreprise",
  particulier: "Particulier",
  association: "Association",
  institutionnel: "Institutionnel",
};

// Chef projet status
export const CHEF_PROJET_STATUS_LABELS = {
  pending: "En attente",
  accepted: "Accepté",
  declined: "Refusé",
};
