#!/usr/bin/env python
"""
Script pour créer un superutilisateur sans interaction
Peut être exécuté sur Render après le déploiement
"""
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'genius_harmony.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Profile

User = get_user_model()

# Créer le superuser s'il n'existe pas
username = 'admin'
email = 'admin@genius-harmony.com'
password = 'Admin123456'  # Changez ce mot de passe en production !

if not User.objects.filter(username=username).exists():
    # Créer l'utilisateur Django
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )

    # Créer ou mettre à jour le profil avec le rôle super_admin
    profile, created = Profile.objects.get_or_create(
        user=user,
        defaults={'role': 'super_admin'}
    )

    if not created:
        profile.role = 'super_admin'
        profile.save()

    print(f'✅ Superuser "{username}" créé avec succès!')
    print(f'📧 Email: {email}')
    print(f'🔑 Password: {password}')
    print(f'👑 Role: super_admin')
    print('')
    print('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!')
else:
    print(f'ℹ️  Le superuser "{username}" existe déjà.')
    user = User.objects.get(username=username)
    # S'assurer que le profil existe et a le bon rôle
    profile, created = Profile.objects.get_or_create(
        user=user,
        defaults={'role': 'super_admin'}
    )
    if profile.role != 'super_admin':
        profile.role = 'super_admin'
        profile.save()
        print('   ✅ Profil mis à jour avec le rôle super_admin')
