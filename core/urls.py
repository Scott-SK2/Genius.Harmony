from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView, MeView,
    PoleListCreateView, PoleDetailView,
    UserListView, UserUpdateView, UserDeleteView, UserUploadPhotoView, UserProfileDetailView,
    ProjetListCreateView, ProjetDetailView, ProjetUpdateStatutView, ProjetAcceptChefView, ProjetDeclineChefView,
    TacheListCreateView, TacheDetailView,
    DocumentListCreateView, DocumentDetailView, DocumentDownloadView,
)
from .views.odoo_webhooks import odoo_deadline_notification, odoo_task_assigned

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
    path('users/<int:pk>/delete/', UserDeleteView.as_view(), name='users-delete'),
    path('users/<int:pk>/upload-photo/', UserUploadPhotoView.as_view(), name='users-upload-photo'),
    path('users/<int:pk>/profile/', UserProfileDetailView.as_view(), name='users-profile-detail'),

    # Projets
    path('projets/', ProjetListCreateView.as_view(), name='projets-list-create'),
    path('projets/<int:pk>/', ProjetDetailView.as_view(), name='projets-detail'),
    path('projets/<int:pk>/update-statut/', ProjetUpdateStatutView.as_view(), name='projets-update-statut'),
    path('projets/<int:pk>/accept-chef/', ProjetAcceptChefView.as_view(), name='projets-accept-chef'),
    path('projets/<int:pk>/decline-chef/', ProjetDeclineChefView.as_view(), name='projets-decline-chef'),

    # Tâches
    path('taches/', TacheListCreateView.as_view(), name='taches-list-create'),
    path('taches/<int:pk>/', TacheDetailView.as_view(), name='taches-detail'),

    # Documents
    path('documents/', DocumentListCreateView.as_view(), name='documents-list-create'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='documents-detail'),
    path('documents/<int:pk>/download/', DocumentDownloadView.as_view(), name='documents-download'),

    # Webhooks Odoo (endpoints appelés par Odoo)
    path('odoo-webhooks/deadline-notification/', odoo_deadline_notification, name='odoo-deadline-notification'),
    path('odoo-webhooks/task-assigned/', odoo_task_assigned, name='odoo-task-assigned'),
]
