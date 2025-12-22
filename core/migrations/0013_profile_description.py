# Generated manually to add description field to Profile model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_add_collaborateur_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='description',
            field=models.TextField(
                blank=True,
                help_text="Description personnelle visible par les autres utilisateurs"
            ),
        ),
    ]
