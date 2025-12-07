from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

User = get_user_model()


class Pole(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Profile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('chef_pole', 'Chef de pôle'),
        ('membre', 'Membre'),
        ('stagiaire', 'Stagiaire'),
        ('client', 'Client / Artiste'),
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

    @receiver(post_save, sender=User)
    def create_or_update_user_profile(sender, instance, created, **kwargs):
        if created:
            # Par défaut, on met un rôle générique 'membre'
            Profile.objects.create(user=instance, role='membre')
        else:
            instance.profile.save()
