# Generated manually for membre specialite feature

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_tache_multiple_assignees'),
    ]

    operations = [
        migrations.AddField(
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
                help_text="Spécialité du membre (uniquement pour le rôle 'membre')",
                max_length=50
            ),
        ),
    ]
