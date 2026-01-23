"""
Tests for core models
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from core.models import Profile, Pole, Projet, Tache, Document

User = get_user_model()


class ProfileModelTest(TestCase):
    """Test Profile model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_profile_created_automatically(self):
        """Test that profile is created automatically via signal"""
        self.assertTrue(hasattr(self.user, 'profile'))
        self.assertIsInstance(self.user.profile, Profile)

    def test_profile_default_role(self):
        """Test that default role is 'membre'"""
        self.assertEqual(self.user.profile.role, 'membre')

    def test_profile_str(self):
        """Test profile string representation"""
        self.assertEqual(str(self.user.profile), 'testuser')


class PoleModelTest(TestCase):
    """Test Pole model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='chefpole',
            email='chef@example.com',
            password='testpass123'
        )
        self.user.profile.role = 'chef_pole'
        self.user.profile.save()

    def test_pole_creation(self):
        """Test creating a pole"""
        pole = Pole.objects.create(
            nom='Production',
            description='Pôle de production',
            chef_pole=self.user
        )
        self.assertEqual(pole.nom, 'Production')
        self.assertEqual(pole.chef_pole, self.user)

    def test_pole_str(self):
        """Test pole string representation"""
        pole = Pole.objects.create(
            nom='Production',
            chef_pole=self.user
        )
        self.assertEqual(str(pole), 'Production')


class ProjetModelTest(TestCase):
    """Test Projet model"""

    def setUp(self):
        self.creator = User.objects.create_user(
            username='creator',
            email='creator@example.com',
            password='testpass123'
        )
        self.pole = Pole.objects.create(nom='Test Pole')

    def test_projet_creation(self):
        """Test creating a project"""
        projet = Projet.objects.create(
            titre='Test Project',
            type='film',
            statut='brouillon',
            pole=self.pole,
            created_by=self.creator
        )
        self.assertEqual(projet.titre, 'Test Project')
        self.assertEqual(projet.statut, 'brouillon')
        self.assertEqual(projet.created_by, self.creator)

    def test_projet_default_chef_status(self):
        """Test default chef_projet_status"""
        projet = Projet.objects.create(
            titre='Test Project',
            type='film',
            pole=self.pole,
            created_by=self.creator
        )
        self.assertEqual(projet.chef_projet_status, 'pending')

    def test_projet_str(self):
        """Test project string representation"""
        projet = Projet.objects.create(
            titre='Test Project',
            type='film',
            pole=self.pole,
            created_by=self.creator
        )
        self.assertEqual(str(projet), 'Test Project')


class TacheModelTest(TestCase):
    """Test Tache model"""

    def setUp(self):
        self.creator = User.objects.create_user(
            username='creator',
            email='creator@example.com',
            password='testpass123'
        )
        self.pole = Pole.objects.create(nom='Test Pole')
        self.projet = Projet.objects.create(
            titre='Test Project',
            type='film',
            pole=self.pole,
            created_by=self.creator
        )

    def test_tache_creation(self):
        """Test creating a task"""
        tache = Tache.objects.create(
            titre='Test Task',
            description='Test description',
            projet=self.projet,
            statut='a_faire',
            priorite='normale'
        )
        self.assertEqual(tache.titre, 'Test Task')
        self.assertEqual(tache.statut, 'a_faire')
        self.assertEqual(tache.priorite, 'normale')

    def test_tache_str(self):
        """Test task string representation"""
        tache = Tache.objects.create(
            titre='Test Task',
            projet=self.projet
        )
        self.assertEqual(str(tache), 'Test Task')


class DocumentModelTest(TestCase):
    """Test Document model"""

    def setUp(self):
        self.creator = User.objects.create_user(
            username='creator',
            email='creator@example.com',
            password='testpass123'
        )
        self.pole = Pole.objects.create(nom='Test Pole')
        self.projet = Projet.objects.create(
            titre='Test Project',
            type='film',
            pole=self.pole,
            created_by=self.creator
        )

    def test_document_creation(self):
        """Test creating a document"""
        document = Document.objects.create(
            titre='Test Document',
            type='scenario',
            projet=self.projet,
            uploade_par=self.creator
        )
        self.assertEqual(document.titre, 'Test Document')
        self.assertEqual(document.type, 'scenario')
        self.assertEqual(document.uploade_par, self.creator)

    def test_document_str(self):
        """Test document string representation"""
        document = Document.objects.create(
            titre='Test Document',
            type='scenario',
            projet=self.projet,
            uploade_par=self.creator
        )
        self.assertEqual(str(document), 'Test Document')
