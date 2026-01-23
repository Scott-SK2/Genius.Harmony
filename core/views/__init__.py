"""
Views module for core app - Refactored for better organization
"""
# Auth views
from .auth import RegisterView, MeView

# User views
from .users import (
    UserListView,
    UserUpdateView,
    UserDeleteView,
    UserUploadPhotoView,
    UserProfileDetailView
)

# Pole views
from .poles import PoleListCreateView, PoleDetailView

# Projet views
from .projets import (
    ProjetListCreateView,
    ProjetDetailView,
    ProjetUpdateStatutView,
    ProjetAcceptChefView,
    ProjetDeclineChefView
)

# Tache views
from .taches import TacheListCreateView, TacheDetailView

# Document views
from .documents import (
    DocumentListCreateView,
    DocumentDetailView,
    DocumentDownloadView
)

__all__ = [
    # Auth
    'RegisterView',
    'MeView',
    # Users
    'UserListView',
    'UserUpdateView',
    'UserDeleteView',
    'UserUploadPhotoView',
    'UserProfileDetailView',
    # Poles
    'PoleListCreateView',
    'PoleDetailView',
    # Projets
    'ProjetListCreateView',
    'ProjetDetailView',
    'ProjetUpdateStatutView',
    'ProjetAcceptChefView',
    'ProjetDeclineChefView',
    # Taches
    'TacheListCreateView',
    'TacheDetailView',
    # Documents
    'DocumentListCreateView',
    'DocumentDetailView',
    'DocumentDownloadView',
]
