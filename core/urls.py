from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView, MeView,
    PoleListCreateView, PoleDetailView,
    UserListView, UserUpdateView, UserProfileDetailView,
    ProjetListCreateView, ProjetDetailView, ProjetUpdateStatutView,
    TacheListCreateView, TacheDetailView,
    DocumentListCreateView, DocumentDetailView,
)

urlpatterns = [
    # Authentification
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/me/', MeView.as_view(), name='auth-me'),

    # Pôles
    path('poles/', PoleListCreateView.as_view(), name='poles-list-create'),
    path('poles/<int:pk>/', PoleDetailView.as_view(), name='poles-detail'),

    # Utilisateurs
    path('users/', UserListView.as_view(), name='users-list'),
    path('users/<int:pk>/', UserUpdateView.as_view(), name='users-update'),
    path('users/<int:pk>/profile/', UserProfileDetailView.as_view(), name='users-profile-detail'),

    # Projets
    path('projets/', ProjetListCreateView.as_view(), name='projets-list-create'),
    path('projets/<int:pk>/', ProjetDetailView.as_view(), name='projets-detail'),
    path('projets/<int:pk>/update-statut/', ProjetUpdateStatutView.as_view(), name='projets-update-statut'),

    # Tâches
    path('taches/', TacheListCreateView.as_view(), name='taches-list-create'),
    path('taches/<int:pk>/', TacheDetailView.as_view(), name='taches-detail'),

    # Documents
    path('documents/', DocumentListCreateView.as_view(), name='documents-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='documents-detail'),
]
