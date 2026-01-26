"""
Constants used throughout the core app
"""

# Projet types
PROJET_TYPES = {
    'film': 'Film',
    'court_metrage': 'Court métrage',
    'web_serie': 'Web série',
    'event': 'Event',
    'atelier_animation': 'Atelier/Animation',
    'musique': 'Musique',
    'autre': 'Autre',
}

# Projet statuts
PROJET_STATUTS = {
    'brouillon': 'Brouillon',
    'en_attente': 'En attente',
    'en_cours': 'En cours',
    'en_revision': 'En révision',
    'termine': 'Terminé',
    'annule': 'Annulé',
}

# Tache statuts
TACHE_STATUTS = {
    'a_faire': 'À faire',
    'en_cours': 'En cours',
    'termine': 'Terminé',
}

# Tache priorités
TACHE_PRIORITES = {
    'basse': 'Basse',
    'normale': 'Normale',
    'haute': 'Haute',
    'urgente': 'Urgente',
}

# Document types
DOCUMENT_TYPES = {
    'scenario': 'Scénario',
    'contrat': 'Contrat',
    'budget': 'Budget',
    'planning': 'Planning',
    'brief': 'Brief',
    'moodboard': 'Moodboard',
    'rush_footage': 'Rush/Footage',
    'montage': 'Montage',
    'export_final': 'Export final',
    'media': 'Media',
    'presskit': 'Presskit',
    'autre': 'Autre',
}

# User roles
USER_ROLES = {
    'super_admin': 'Super Administrateur',
    'admin': 'Administrateur',
    'chef_pole': 'Chef de Pôle',
    'membre': 'Membre',
    'stagiaire': 'Stagiaire',
    'collaborateur': 'Collaborateur',
    'artiste': 'Artiste',
    'client': 'Client',
    'partenaire': 'Partenaire',
}

# Membre specialités
MEMBRE_SPECIALITES = {
    'musicien': 'Musicien',
    'manager': 'Manager',
    'photographe': 'Photographe',
    'videaste': 'Vidéaste',
    'monteur': 'Monteur',
    'graphiste': 'Graphiste',
    'developpeur': 'Développeur',
    'redacteur': 'Rédacteur',
    'autre': 'Autre',
}

# Client types
CLIENT_TYPES = {
    'entreprise': 'Entreprise',
    'particulier': 'Particulier',
    'association': 'Association',
    'institutionnel': 'Institutionnel',
}

# Chef projet status
CHEF_PROJET_STATUS = {
    'pending': 'En attente',
    'accepted': 'Accepté',
    'declined': 'Refusé',
}
