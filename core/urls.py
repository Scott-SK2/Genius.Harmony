from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import RegisterView, MeView, PoleListCreateView, PoleDetailView, UserListView, UserUpdateView
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('poles/', PoleListCreateView.as_view(), name='poles-list-create'),
    path('poles/<int:pk>/', PoleDetailView.as_view(), name='poles-detail'),

    path('users/', UserListView.as_view(), name='users-list'),
    path('users/<int:pk>/', UserUpdateView.as_view(), name='users-update'),
]
