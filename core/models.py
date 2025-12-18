from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()


class Pole(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    chef = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='pole_dirige', help_text="Chef de pôle désigné")

    def __str__(self):
        return self.name


class Profile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('chef_pole', 'Chef de pôle'),
        ('membre', 'Membre'),
        ('stagiaire', 'Stagiaire'),
        ('technicien', 'Technicien'),
        ('artiste', 'Artiste'),
        ('client', 'Client'),
        ('partenaire', 'Partenaire'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    pole = models.ForeignKey(Pole, on_delete=models.SET_NULL, null=True, blank=True)

    # Lien futur vers Odoo
    odoo_partner_id = models.IntegerField(null=True, blank=True)

    # Pour préciser la nature du client (facultatif)
    client_type = models.CharField(
        max_length=50,
        blank=True,
        help_text="Ex: Artiste, Sponsor, Institution, Marque..."
    )

    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    tiktok = models.URLField(blank=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Projet(models.Model):
    TYPE_CHOICES = [
        ('film', 'Film'),
        ('court_metrage', 'Court métrage'),
        ('web_serie', 'Web série'),
        ('event', 'Event'),
        ('atelier_animation', 'Atelier/Animation'),
        ('musique', 'Musique'),
        ('autre', 'Autre'),
    ]

    STATUT_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('en_attente', 'En attente'),
        ('en_cours', 'En cours'),
        ('en_revision', 'En révision'),
        ('termine', 'Terminé'),
        ('annule', 'Annulé'),
    ]

    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='brouillon')

    # Relations
    pole = models.ForeignKey(Pole, on_delete=models.SET_NULL, null=True, blank=True, related_name='projets')
    client = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='projets_client')
    chef_projet = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='projets_geres')
    membres = models.ManyToManyField(User, blank=True, related_name='projets_membre')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='projets_crees', help_text="Utilisateur qui a créé le projet")

    # Liens Odoo (pour plus tard)
    odoo_project_id = models.IntegerField(null=True, blank=True)
    odoo_invoice_id = models.IntegerField(null=True, blank=True)

    # Dates
    date_debut = models.DateField(null=True, blank=True)
    date_fin_prevue = models.DateField(null=True, blank=True)
    date_fin_reelle = models.DateField(null=True, blank=True)

    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Projet'
        verbose_name_plural = 'Projets'

    def __str__(self):
        return f"{self.titre} ({self.get_type_display()})"


class Tache(models.Model):
    STATUT_CHOICES = [
        ('a_faire', 'À faire'),
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
    ]

    PRIORITE_CHOICES = [
        ('basse', 'Basse'),
        ('normale', 'Normale'),
        ('haute', 'Haute'),
        ('urgente', 'Urgente'),
    ]

    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='taches')
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='a_faire')
    priorite = models.CharField(max_length=20, choices=PRIORITE_CHOICES, default='normale')

    # Assignation
    assigne_a = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='taches_assignees')

    # Dates
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['deadline', '-priorite']
        verbose_name = 'Tâche'
        verbose_name_plural = 'Tâches'

    def __str__(self):
        return f"{self.titre} - {self.projet.titre}"


class Document(models.Model):
    TYPE_CHOICES = [
        ('scenario', 'Scénario'),
        ('contrat', 'Contrat'),
        ('brief', 'Brief'),
        ('moodboard', 'Moodboard'),
        ('rush', 'Rush / Footage'),
        ('montage', 'Montage'),
        ('export_final', 'Export final'),
        ('presskit', 'Presskit'),
        ('autre', 'Autre'),
    ]

    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name='documents')
    titre = models.CharField(max_length=200)
    fichier = models.FileField(upload_to='documents/%Y/%m/%d/')
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='autre')
    description = models.TextField(blank=True)

    # Métadonnées
    uploade_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='documents_uploades')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'

    def __str__(self):
        return f"{self.titre} - {self.projet.titre}"


# Signal pour créer automatiquement un profil lors de la création d'un utilisateur
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        # Par défaut, on met un rôle générique 'membre'
        Profile.objects.create(user=instance, role='membre')
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()
