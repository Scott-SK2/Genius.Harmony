"""
Helper functions for role checking and common utilities
"""


def is_admin_or_super(profile):
    """Vérifie si l'utilisateur est admin ou super_admin"""
    return profile and profile.role in ['admin', 'super_admin']


def is_super_admin(profile):
    """Vérifie si l'utilisateur est super_admin uniquement"""
    return profile and profile.role == 'super_admin'
