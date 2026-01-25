from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, m2m_changed
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
        ('super_admin', 'Super Administrateur'),
        ('admin', 'Administrateur'),
        ('chef_pole', 'Chef de pôle'),
        ('membre', 'Membre'),
        ('stagiaire', 'Stagiaire'),
        ('collaborateur', 'Collaborateur'),
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

    # Spécialité pour les membres et chefs de pôle (attribué par admin uniquement)
    MEMBRE_SPECIALITE_CHOICES = [
        ('', 'Non spécifié'),
        ('musicien', 'Musicien'),
        ('manager', 'Manager'),
        ('model', 'Modèle'),
        ('photographe', 'Photographe'),
        ('videaste', 'Vidéaste'),
        ('graphiste', 'Graphiste'),
        ('developpeur', 'Développeur'),
        ('commercial', 'Commercial'),
        ('assistant', 'Assistant'),
        ('autre', 'Autre'),
    ]
    membre_specialite = models.CharField(
        max_length=50,
        choices=MEMBRE_SPECIALITE_CHOICES,
        blank=True,
        help_text="Spécialité pour les membres et chefs de pôle"
    )

    # Description personnelle de l'utilisateur
    description = models.TextField(
        blank=True,
        help_text="Description personnelle visible par les autres utilisateurs"
    )

    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    tiktok = models.URLField(blank=True)

    # Photo de profil
    photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


# Signal pour créer automatiquement un profil lors de la création d'un utilisateur
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance, role='membre')


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()


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

    CHEF_PROJET_STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('accepted', 'Accepté'),
        ('declined', 'Refusé'),
    ]

    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='brouillon')

    # Relations
    pole = models.ForeignKey(Pole, on_delete=models.SET_NULL, null=True, blank=True, related_name='projets')
    client = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='projets_client')
    chef_projet = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='projets_geres')
    chef_projet_status = models.CharField(max_length=20, choices=CHEF_PROJET_STATUS_CHOICES, null=True, blank=True, help_text="Statut d'acceptation du chef de projet")
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

    # Assignation (plusieurs personnes possibles)
    assigne_a = models.ManyToManyField(User, blank=True, related_name='taches_assignees')

    # Lien Odoo
    odoo_task_id = models.IntegerField(null=True, blank=True, help_text="ID de la tâche dans Odoo")

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
        ('budget', 'Budget'),
        ('planning', 'Planning'),
        ('brief', 'Brief'),
        ('moodboard', 'Moodboard'),
        ('rush', 'Rush / Footage'),
        ('montage', 'Montage'),
        ('export_final', 'Export final'),
        ('media', 'Media'),
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


class Notification(models.Model):
    """
    Système de notifications pour les utilisateurs

    Types de notifications:
    - deadline_3days: Tâche avec deadline dans 3 jours
    - deadline_1day: Tâche avec deadline demain
    - deadline_today: Tâche avec deadline aujourd'hui
    - deadline_overdue: Tâche en retard
    - project_assigned: Nouveau projet assigné
    - task_assigned: Nouvelle tâche assignée
    """

    TYPE_CHOICES = [
        ('deadline_3days', '📅 Deadline dans 3 jours'),
        ('deadline_1day', '⚠️ Deadline demain'),
        ('deadline_today', '🔴 Deadline aujourd\'hui'),
        ('deadline_overdue', '❌ Tâche en retard'),
        ('project_assigned', '🎯 Nouveau projet assigné'),
        ('task_assigned', '📋 Nouvelle tâche assignée'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    titre = models.CharField(max_length=200)
    message = models.TextField()

    # Relations optionnelles
    tache = models.ForeignKey(Tache, on_delete=models.CASCADE, null=True, blank=True)
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, null=True, blank=True)

    # État
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        status = "✓" if self.is_read else "•"
        return f"{status} {self.user.username}: {self.titre}"

    def mark_as_read(self):
        """Marquer la notification comme lue"""
        from django.utils import timezone
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


# Signal pour créer automatiquement un profil lors de la création d'un utilisateur
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        # Par défaut, on met un rôle générique 'membre'
        # Utiliser get_or_create pour éviter les erreurs de duplication
        Profile.objects.get_or_create(user=instance, defaults={'role': 'membre'})
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()


# Signal pour ajouter automatiquement les utilisateurs assignés à une tâche comme membres du projet
@receiver(m2m_changed, sender=Tache.assigne_a.through)
def auto_add_task_assignees_to_project(sender, instance, action, pk_set, **kwargs):
    """
    Lorsqu'on assigne une personne à une tâche, si la personne n'était pas assignée au projet,
    elle le devient automatiquement.
    """
    if action == 'post_add' and pk_set:
        # instance est la tâche
        # pk_set contient les IDs des utilisateurs qui viennent d'être ajoutés
        projet = instance.projet

        # Récupérer les utilisateurs assignés à la tâche
        users_to_add = User.objects.filter(pk__in=pk_set)

        # Ajouter chaque utilisateur au projet s'il n'est pas déjà membre
        for user in users_to_add:
            if not projet.membres.filter(pk=user.pk).exists():
                projet.membres.add(user)


# ========================================
# SIGNAUX POUR ODOO SYNC ET NOTIFICATIONS
# ========================================

@receiver(post_save, sender=Profile)
def sync_profile_to_odoo(sender, instance, created, **kwargs):
    """
    Synchronise automatiquement le profil vers Odoo quand il est modifié

    Déclenché quand l'utilisateur édite son profil (nom, email, téléphone, etc.)
    """
    # Ne pas sync lors de la création du profil (registration)
    # Le batch sync s'en chargera plus tard
    if created:
        return

    # Éviter les boucles infinies (si on sauvegarde odoo_partner_id)
    if 'odoo_partner_id' in kwargs.get('update_fields', []):
        return

    # Import ici pour éviter les imports circulaires
    from core.tasks import sync_user_to_odoo

    # Lancer la sync en async
    # Si Celery n'est pas connecté, ne pas crasher l'opération
    try:
        sync_user_to_odoo.delay(instance.user.id)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"⚠️ Failed to queue Odoo sync for user {instance.user.id}: {e}")


@receiver(m2m_changed, sender=Tache.assigne_a.through)
def notify_task_assignment(sender, instance, action, pk_set, **kwargs):
    """
    Crée une notification quand un utilisateur est assigné à une tâche
    """
    if action == 'post_add' and pk_set:
        # Import ici pour éviter les imports circulaires
        from core.tasks import create_task_assigned_notification
        import logging
        logger = logging.getLogger(__name__)

        # Créer une notification pour chaque utilisateur assigné
        for user_id in pk_set:
            try:
                create_task_assigned_notification.delay(instance.id, user_id)
            except Exception as e:
                logger.warning(f"⚠️ Failed to queue task assignment notification: {e}")


@receiver(m2m_changed, sender=Projet.membres.through)
def notify_project_assignment(sender, instance, action, pk_set, **kwargs):
    """
    Crée une notification quand un utilisateur est ajouté à un projet
    """
    if action == 'post_add' and pk_set:
        # Import ici pour éviter les imports circulaires
        from core.tasks import create_project_assigned_notification
        import logging
        logger = logging.getLogger(__name__)

        # Créer une notification pour chaque membre ajouté
        for user_id in pk_set:
            try:
                create_project_assigned_notification.delay(instance.id, user_id)
            except Exception as e:
                logger.warning(f"⚠️ Failed to queue project assignment notification: {e}")
