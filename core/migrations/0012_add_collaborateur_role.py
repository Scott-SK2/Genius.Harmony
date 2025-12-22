# Generated manually to add collaborateur role

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_update_specialite_help_text'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='role',
            field=models.CharField(
                choices=[
                    ('super_admin', 'Super Administrateur'),
                    ('admin', 'Administrateur'),
                    ('chef_pole', 'Chef de pôle'),
                    ('membre', 'Membre'),
                    ('stagiaire', 'Stagiaire'),
                    ('collaborateur', 'Collaborateur'),
                    ('artiste', 'Artiste'),
                    ('client', 'Client'),
                    ('partenaire', 'Partenaire'),
                ],
                max_length=20
            ),
        ),
    ]
