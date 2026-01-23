"""
Permissions module for core app
"""
from .users import IsAdminUserProfile, CanEditOwnProfile, CanViewUsers
from .poles import CanViewPoles
from .projets import CanViewProjet, CanManageProjet
from .taches import CanViewTache, CanCreateTache, CanManageTache
from .documents import CanDeleteDocument

__all__ = [
    'IsAdminUserProfile',
    'CanEditOwnProfile',
    'CanViewUsers',
    'CanViewPoles',
    'CanViewProjet',
    'CanManageProjet',
    'CanViewTache',
    'CanCreateTache',
    'CanManageTache',
    'CanDeleteDocument',
]
