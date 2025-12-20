# Generated manually for multi-assignment feature

from django.conf import settings
from django.db import migrations, models


def migrate_existing_assignments(apps, schema_editor):
    """
    Migre les assignations existantes de ForeignKey vers ManyToManyField.
    Si une tâche avait assigne_a=user_id, on ajoute cet user dans la relation many-to-many.
    """
    Tache = apps.get_model('core', 'Tache')
    db_alias = schema_editor.connection.alias

    # Pour chaque tâche qui avait un assigné
    for tache in Tache.objects.using(db_alias).all():
        if hasattr(tache, 'assigne_a_old') and tache.assigne_a_old:
            # Ajouter l'utilisateur à la relation many-to-many
            tache.assigne_a.add(tache.assigne_a_old)


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0008_add_super_admin_role'),
    ]

    operations = [
        # Étape 1: Renommer l'ancien champ ForeignKey
        migrations.RenameField(
            model_name='tache',
            old_name='assigne_a',
            new_name='assigne_a_old',
        ),

        # Étape 2: Créer le nouveau champ ManyToManyField
        migrations.AddField(
            model_name='tache',
            name='assigne_a',
            field=models.ManyToManyField(
                blank=True,
                related_name='taches_assignees',
                to=settings.AUTH_USER_MODEL
            ),
        ),

        # Étape 3: Migrer les données existantes
        migrations.RunPython(migrate_existing_assignments, migrations.RunPython.noop),

        # Étape 4: Supprimer l'ancien champ
        migrations.RemoveField(
            model_name='tache',
            name='assigne_a_old',
        ),
    ]
