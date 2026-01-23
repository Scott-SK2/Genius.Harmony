"""
Tests for permissions
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from core.models import Profile, Pole, Projet
from core.utils.helpers import is_admin_or_super, is_super_admin
from core.services import ProjetService

User = get_user_model()


class HelperFunctionsTest(TestCase):
    """Test helper functions"""

    def setUp(self):
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='testpass123'
        )
        self.admin_user.profile.role = 'admin'
        self.admin_user.profile.save()

        self.super_admin_user = User.objects.create_user(
            username='superadmin',
            email='superadmin@example.com',
            password='testpass123'
        )
        self.super_admin_user.profile.role = 'super_admin'
        self.super_admin_user.profile.save()

        self.member_user = User.objects.create_user(
            username='member',
            email='member@example.com',
            password='testpass123'
        )

    def test_is_admin_or_super(self):
        """Test is_admin_or_super helper"""
        self.assertTrue(is_admin_or_super(self.admin_user.profile))
        self.assertTrue(is_admin_or_super(self.super_admin_user.profile))
        self.assertFalse(is_admin_or_super(self.member_user.profile))

    def test_is_super_admin(self):
        """Test is_super_admin helper"""
        self.assertFalse(is_super_admin(self.admin_user.profile))
        self.assertTrue(is_super_admin(self.super_admin_user.profile))
        self.assertFalse(is_super_admin(self.member_user.profile))


class ProjetServiceTest(TestCase):
    """Test ProjetService business logic"""

    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='testpass123'
        )
        self.admin.profile.role = 'admin'
        self.admin.profile.save()

        self.creator = User.objects.create_user(
            username='creator',
            email='creator@example.com',
            password='testpass123'
        )

        self.member = User.objects.create_user(
            username='member',
            email='member@example.com',
            password='testpass123'
        )

        self.pole = Pole.objects.create(nom='Test Pole')
        self.projet = Projet.objects.create(
            titre='Test Project',
            type='film',
            statut='brouillon',
            pole=self.pole,
            created_by=self.creator
        )

    def test_can_user_view_projet_admin(self):
        """Test admin can view all projects"""
        self.assertTrue(ProjetService.can_user_view_projet(self.admin, self.projet))

    def test_can_user_view_projet_creator(self):
        """Test creator can view their projects"""
        self.assertTrue(ProjetService.can_user_view_projet(self.creator, self.projet))

    def test_can_user_view_projet_member_brouillon(self):
        """Test member cannot view brouillon projects"""
        self.assertFalse(ProjetService.can_user_view_projet(self.member, self.projet))

    def test_can_user_view_projet_member_public(self):
        """Test member can view public projects if they're a member"""
        self.projet.statut = 'en_cours'
        self.projet.membres.add(self.member)
        self.projet.save()
        self.assertTrue(ProjetService.can_user_view_projet(self.member, self.projet))

    def test_can_user_manage_projet_admin(self):
        """Test admin can manage all projects"""
        self.assertTrue(ProjetService.can_user_manage_projet(self.admin, self.projet))

    def test_can_user_manage_projet_creator(self):
        """Test creator can manage their projects"""
        self.assertTrue(ProjetService.can_user_manage_projet(self.creator, self.projet))

    def test_can_user_manage_projet_member(self):
        """Test regular member cannot manage projects"""
        self.assertFalse(ProjetService.can_user_manage_projet(self.member, self.projet))

    def test_can_user_delete_projet_admin(self):
        """Test only super_admin can delete"""
        self.assertFalse(ProjetService.can_user_delete_projet(self.admin, self.projet))

        super_admin = User.objects.create_user(
            username='superadmin',
            email='superadmin@example.com',
            password='testpass123'
        )
        super_admin.profile.role = 'super_admin'
        super_admin.profile.save()

        self.assertTrue(ProjetService.can_user_delete_projet(super_admin, self.projet))

    def test_get_available_statuts_for_user_admin(self):
        """Test admin gets all statuts"""
        statuts = ProjetService.get_available_statuts_for_user(self.admin, self.projet)
        expected = ['brouillon', 'en_attente', 'en_cours', 'en_revision', 'termine', 'annule']
        self.assertEqual(statuts, expected)

    def test_get_available_statuts_for_user_chef_projet(self):
        """Test chef_projet gets limited statuts"""
        self.projet.chef_projet = self.member
        self.projet.save()
        statuts = ProjetService.get_available_statuts_for_user(self.member, self.projet)
        expected = ['en_revision', 'termine', 'annule']
        self.assertEqual(statuts, expected)

    def test_can_user_manage_membres_admin(self):
        """Test admin can manage membres"""
        self.assertTrue(ProjetService.can_user_manage_membres(self.admin, self.projet))

    def test_can_user_manage_membres_chef_projet(self):
        """Test chef_projet can manage membres"""
        self.projet.chef_projet = self.member
        self.projet.save()
        self.assertTrue(ProjetService.can_user_manage_membres(self.member, self.projet))

    def test_get_next_statut(self):
        """Test workflow statut progression"""
        self.assertEqual(ProjetService.get_next_statut('brouillon'), 'en_attente')
        self.assertEqual(ProjetService.get_next_statut('en_attente'), 'en_cours')
        self.assertEqual(ProjetService.get_next_statut('en_cours'), 'en_revision')
        self.assertEqual(ProjetService.get_next_statut('en_revision'), 'termine')

    def test_auto_adjust_statut_for_admin(self):
        """Test admin auto-adjustment of statut"""
        self.assertEqual(ProjetService.auto_adjust_statut_for_admin('brouillon', True), 'en_cours')
        self.assertEqual(ProjetService.auto_adjust_statut_for_admin('en_attente', True), 'en_cours')
        self.assertEqual(ProjetService.auto_adjust_statut_for_admin('termine', True), 'termine')
        self.assertEqual(ProjetService.auto_adjust_statut_for_admin('brouillon', False), 'brouillon')
