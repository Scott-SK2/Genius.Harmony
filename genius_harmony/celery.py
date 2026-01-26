"""
Celery configuration for Genius Harmony

This module configures Celery for async task processing.
Workers will process:
- Odoo synchronization (users, projects, tasks)
- Deadline notifications
- Batch operations
"""
import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'genius_harmony.settings')

app = Celery('genius_harmony')

# Load config from Django settings with 'CELERY_' prefix
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# Celery Beat Schedule (Periodic tasks)
app.conf.beat_schedule = {
    # Check for upcoming deadlines every hour
    'check-deadline-notifications': {
        'task': 'core.tasks.check_deadline_notifications',
        'schedule': crontab(minute=0),  # Every hour
    },
    # Batch sync pending Odoo updates every 30 seconds
    'batch-sync-odoo-pending': {
        'task': 'core.tasks.batch_sync_odoo_pending',
        'schedule': 30.0,  # Every 30 seconds
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task to test Celery is working"""
    print(f'Request: {self.request!r}')
