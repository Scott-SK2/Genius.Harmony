# Generated manually to update help_text for membre_specialite field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_profile_membre_specialite'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='membre_specialite',
            field=models.CharField(
                blank=True,
                choices=[
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
                ],
                help_text='Spécialité pour les membres et chefs de pôle',
                max_length=50
            ),
        ),
    ]
