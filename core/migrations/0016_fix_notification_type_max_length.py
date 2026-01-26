# Generated manually to fix Notification.type max_length
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_odoo_integration'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='type',
            field=models.CharField(
                choices=[
                    ('deadline_3days', '📅 Deadline dans 3 jours'),
                    ('deadline_1day', '⚠️ Deadline demain'),
                    ('deadline_today', "🔴 Deadline aujourd'hui"),
                    ('deadline_overdue', '❌ Tâche en retard'),
                    ('project_assigned', '🎯 Nouveau projet assigné'),
                    ('project_leader_assigned', '👔 Chef de projet assigné'),
                    ('task_assigned', '📋 Nouvelle tâche assignée'),
                ],
                max_length=30
            ),
        ),
    ]
