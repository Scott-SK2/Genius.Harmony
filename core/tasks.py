"""
Celery tasks for Genius Harmony

This module contains all async tasks for:
- Odoo synchronization (users, projects, tasks)
- Deadline notifications
- Batch operations

Tasks are executed by Celery workers and scheduled by Celery Beat.
"""
import logging
from datetime import date, timedelta
from celery import shared_task
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone

from core.models import Profile, Projet, Tache, Notification
from core.odoo_gateway import odoo_gateway, OdooNotConfiguredError

User = get_user_model()
logger = logging.getLogger(__name__)


# ========================================
# USER SYNCHRONIZATION
# ========================================

@shared_task(bind=True, max_retries=3)
def sync_user_to_odoo(self, user_id):
    """
    Synchronise un utilisateur vers Odoo (contact partner)

    Args:
        user_id: ID de l'utilisateur Django

    Returns:
        int: Odoo partner ID

    Raises:
        Retry si erreur temporaire
    """
    try:
        user = User.objects.get(id=user_id)
        profile = user.profile

        # Préparer les données utilisateur
        user_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone': profile.phone,
        }

        # Si l'utilisateur a déjà un partner_id Odoo, mettre à jour
        if profile.odoo_partner_id:
            odoo_gateway.update_partner(profile.odoo_partner_id, user_data)
            logger.info(f"✅ Updated Odoo partner {profile.odoo_partner_id} for user {user.username}")
            return profile.odoo_partner_id

        # Sinon, créer un nouveau partner
        partner_id = odoo_gateway.create_partner(user_data)

        # Sauvegarder l'ID Odoo dans le profil
        profile.odoo_partner_id = partner_id
        profile.save(update_fields=['odoo_partner_id'])

        logger.info(f"✅ Created Odoo partner {partner_id} for user {user.username}")
        return partner_id

    except OdooNotConfiguredError:
        logger.warning("⚠️ Odoo not configured, skipping sync")
        return None

    except Exception as e:
        logger.error(f"❌ Failed to sync user {user_id} to Odoo: {e}")
        # Retry avec backoff exponentiel
        raise self.retry(exc=e, countdown=2 ** self.request.retries * 60)


@shared_task(bind=True, max_retries=3)
def delete_user_from_odoo_task(self, odoo_partner_id):
    """
    Supprime un contact partner dans Odoo

    Args:
        odoo_partner_id: ID du partner Odoo à supprimer

    Returns:
        bool: True si supprimé avec succès
    """
    try:
        odoo_gateway.delete_partner(odoo_partner_id)
        logger.info(f"✅ Deleted Odoo partner {odoo_partner_id}")
        return True

    except OdooNotConfiguredError:
        logger.warning("⚠️ Odoo not configured, skipping deletion")
        return False

    except Exception as e:
        logger.error(f"❌ Failed to delete partner {odoo_partner_id} from Odoo: {e}")
        # Retry avec backoff exponentiel
        raise self.retry(exc=e, countdown=2 ** self.request.retries * 60)


# ========================================
# PROJECT SYNCHRONIZATION
# ========================================

@shared_task(bind=True, max_retries=3)
def sync_projet_to_odoo(self, projet_id):
    """
    Synchronise un projet vers Odoo

    Args:
        projet_id: ID du projet Django

    Returns:
        int: Odoo project ID
    """
    try:
        projet = Projet.objects.select_related('client', 'client__profile').get(id=projet_id)

        # Si le client n'a pas de partner_id Odoo, le créer d'abord
        client_odoo_id = None
        if projet.client:
            profile = projet.client.profile
            if not profile.odoo_partner_id:
                # Créer le partner client en synchrone (nécessaire pour créer le projet)
                client_odoo_id = sync_user_to_odoo(projet.client.id)
            else:
                client_odoo_id = profile.odoo_partner_id

        # Préparer les données projet
        projet_data = {
            'id': projet.id,
            'titre': projet.titre,
            'description': projet.description,
            'client_odoo_id': client_odoo_id,
            'date_debut': projet.date_debut,
            'date_fin_prevue': projet.date_fin_prevue,
        }

        # Si le projet a déjà un project_id Odoo, mettre à jour
        if projet.odoo_project_id:
            odoo_gateway.update_project(projet.odoo_project_id, projet_data)
            logger.info(f"✅ Updated Odoo project {projet.odoo_project_id} for projet {projet.titre}")
            return projet.odoo_project_id

        # Sinon, créer un nouveau projet
        project_id = odoo_gateway.create_project(projet_data)

        # Sauvegarder l'ID Odoo
        projet.odoo_project_id = project_id
        projet.save(update_fields=['odoo_project_id'])

        logger.info(f"✅ Created Odoo project {project_id} for projet {projet.titre}")
        return project_id

    except OdooNotConfiguredError:
        logger.warning("⚠️ Odoo not configured, skipping sync")
        return None

    except Exception as e:
        logger.error(f"❌ Failed to sync projet {projet_id} to Odoo: {e}")
        raise self.retry(exc=e, countdown=2 ** self.request.retries * 60)


# ========================================
# TASK SYNCHRONIZATION
# ========================================

@shared_task(bind=True, max_retries=3)
def sync_tache_to_odoo(self, tache_id):
    """
    Synchronise une tâche vers Odoo

    Args:
        tache_id: ID de la tâche Django

    Returns:
        int: Odoo task ID
    """
    try:
        tache = Tache.objects.select_related('projet').get(id=tache_id)

        # Si le projet n'a pas d'ID Odoo, le créer d'abord
        if not tache.projet.odoo_project_id:
            sync_projet_to_odoo(tache.projet.id)
            tache.projet.refresh_from_db()

        # Préparer les données tâche
        tache_data = {
            'id': tache.id,
            'titre': tache.titre,
            'description': tache.description,
            'projet_odoo_id': tache.projet.odoo_project_id,
            'deadline': tache.deadline,
            'priorite': tache.priorite,
        }

        # Créer la tâche dans Odoo (pas de update pour les tâches dans cette version)
        if not tache.odoo_task_id:
            task_id = odoo_gateway.create_task(tache_data)

            # Sauvegarder l'ID Odoo
            tache.odoo_task_id = task_id
            tache.save(update_fields=['odoo_task_id'])

            logger.info(f"✅ Created Odoo task {task_id} for tache {tache.titre}")
            return task_id
        else:
            logger.info(f"⏭️ Task {tache_id} already synced to Odoo (task_id={tache.odoo_task_id})")
            return tache.odoo_task_id

    except OdooNotConfiguredError:
        logger.warning("⚠️ Odoo not configured, skipping sync")
        return None

    except Exception as e:
        logger.error(f"❌ Failed to sync tache {tache_id} to Odoo: {e}")
        raise self.retry(exc=e, countdown=2 ** self.request.retries * 60)


# ========================================
# BATCH OPERATIONS
# ========================================

@shared_task
def batch_sync_odoo_pending():
    """
    Synchronise en batch toutes les entités non synchronisées avec Odoo

    Appelé toutes les 30 secondes par Celery Beat.
    Optimise les appels API en groupant les opérations.
    """
    try:
        # 1. Sync users sans odoo_partner_id
        pending_users = Profile.objects.filter(odoo_partner_id__isnull=True).select_related('user')[:10]

        if pending_users:
            logger.info(f"📦 Batch syncing {len(pending_users)} users to Odoo...")
            for profile in pending_users:
                sync_user_to_odoo.delay(profile.user.id)

        # 2. Sync projets sans odoo_project_id
        pending_projets = Projet.objects.filter(odoo_project_id__isnull=True)[:10]

        if pending_projets:
            logger.info(f"📦 Batch syncing {len(pending_projets)} projets to Odoo...")
            for projet in pending_projets:
                sync_projet_to_odoo.delay(projet.id)

        # 3. Sync tâches sans odoo_task_id (BATCH CREATE)
        pending_taches = Tache.objects.filter(
            odoo_task_id__isnull=True,
            projet__odoo_project_id__isnull=False  # Seulement si projet déjà sync
        ).select_related('projet')[:20]

        if pending_taches:
            logger.info(f"📦 Batch syncing {len(pending_taches)} taches to Odoo...")

            # Grouper par projet pour optimiser
            taches_by_projet = {}
            for tache in pending_taches:
                if tache.projet.odoo_project_id not in taches_by_projet:
                    taches_by_projet[tache.projet.odoo_project_id] = []
                taches_by_projet[tache.projet.odoo_project_id].append(tache)

            # Créer en batch par projet
            for projet_odoo_id, taches in taches_by_projet.items():
                taches_data = [
                    {
                        'id': t.id,
                        'titre': t.titre,
                        'description': t.description,
                        'projet_odoo_id': projet_odoo_id,
                        'deadline': t.deadline,
                        'priorite': t.priorite,
                    }
                    for t in taches
                ]

                task_ids = odoo_gateway.batch_create_tasks(taches_data)

                # Sauvegarder les IDs Odoo
                for tache, task_id in zip(taches, task_ids):
                    tache.odoo_task_id = task_id
                    tache.save(update_fields=['odoo_task_id'])

        logger.info("✅ Batch sync completed")

    except OdooNotConfiguredError:
        logger.debug("Odoo not configured, skipping batch sync")

    except Exception as e:
        logger.error(f"❌ Batch sync failed: {e}")


# ========================================
# NOTIFICATIONS
# ========================================

@shared_task
def check_deadline_notifications():
    """
    Vérifie les deadlines et crée des notifications pour les utilisateurs

    Appelé toutes les heures par Celery Beat.

    Notifications créées pour:
    - Deadline dans 3 jours
    - Deadline demain
    - Deadline aujourd'hui
    - Tâches en retard
    """
    try:
        today = date.today()
        tomorrow = today + timedelta(days=1)
        in_3_days = today + timedelta(days=3)

        logger.info(f"🔔 Checking deadline notifications for {today}")

        # 1. Tâches avec deadline dans 3 jours
        taches_3days = Tache.objects.filter(
            deadline=in_3_days,
            statut__in=['a_faire', 'en_cours']
        ).select_related('projet').prefetch_related('assigne_a')

        for tache in taches_3days:
            # Récupérer les destinataires : assignés + chef de projet
            destinataires = set(tache.assigne_a.all())
            if tache.projet.chef:
                destinataires.add(tache.projet.chef)

            for user in destinataires:
                # Vérifier si notification déjà créée
                if not Notification.objects.filter(
                    user=user,
                    tache=tache,
                    type='deadline_3days',
                    created_at__date=today
                ).exists():
                    Notification.objects.create(
                        user=user,
                        type='deadline_3days',
                        titre=f"Deadline dans 3 jours",
                        message=f"{tache.titre} • {tache.deadline.strftime('%d/%m/%Y')}",
                        tache=tache,
                        projet=tache.projet
                    )
                    logger.info(f"📅 Created 3-day notification for user {user.username} - task {tache.titre}")

        # 2. Tâches avec deadline demain
        taches_tomorrow = Tache.objects.filter(
            deadline=tomorrow,
            statut__in=['a_faire', 'en_cours']
        ).select_related('projet').prefetch_related('assigne_a')

        for tache in taches_tomorrow:
            # Récupérer les destinataires : assignés + chef de projet
            destinataires = set(tache.assigne_a.all())
            if tache.projet.chef:
                destinataires.add(tache.projet.chef)

            for user in destinataires:
                if not Notification.objects.filter(
                    user=user,
                    tache=tache,
                    type='deadline_1day',
                    created_at__date=today
                ).exists():
                    Notification.objects.create(
                        user=user,
                        type='deadline_1day',
                        titre=f"Deadline demain",
                        message=f"{tache.titre} • Échéance demain",
                        tache=tache,
                        projet=tache.projet
                    )
                    logger.info(f"⚠️ Created 1-day notification for user {user.username} - task {tache.titre}")

        # 3. Tâches avec deadline aujourd'hui
        taches_today = Tache.objects.filter(
            deadline=today,
            statut__in=['a_faire', 'en_cours']
        ).select_related('projet').prefetch_related('assigne_a')

        for tache in taches_today:
            # Récupérer les destinataires : assignés + chef de projet
            destinataires = set(tache.assigne_a.all())
            if tache.projet.chef:
                destinataires.add(tache.projet.chef)

            for user in destinataires:
                if not Notification.objects.filter(
                    user=user,
                    tache=tache,
                    type='deadline_today',
                    created_at__date=today
                ).exists():
                    Notification.objects.create(
                        user=user,
                        type='deadline_today',
                        titre=f"Deadline AUJOURD'HUI",
                        message=f"{tache.titre} • À terminer aujourd'hui",
                        tache=tache,
                        projet=tache.projet
                    )
                    logger.info(f"🔴 Created today notification for user {user.username} - task {tache.titre}")

        # 4. Tâches en retard
        taches_overdue = Tache.objects.filter(
            deadline__lt=today,
            statut__in=['a_faire', 'en_cours']
        ).select_related('projet').prefetch_related('assigne_a')

        for tache in taches_overdue:
            # Récupérer les destinataires : assignés + chef de projet
            destinataires = set(tache.assigne_a.all())
            if tache.projet.chef:
                destinataires.add(tache.projet.chef)

            for user in destinataires:
                # Pour les tâches en retard, créer une notification par jour
                if not Notification.objects.filter(
                    user=user,
                    tache=tache,
                    type='deadline_overdue',
                    created_at__date=today
                ).exists():
                    days_overdue = (today - tache.deadline).days
                    Notification.objects.create(
                        user=user,
                        type='deadline_overdue',
                        titre=f"Tâche en retard",
                        message=f"{tache.titre} • Retard de {days_overdue} jour(s)",
                        tache=tache,
                        projet=tache.projet
                    )
                    logger.info(f"❌ Created overdue notification for user {user.username} - task {tache.titre} ({days_overdue} days)")

        logger.info("✅ Deadline notifications check completed")

    except Exception as e:
        logger.error(f"❌ Failed to check deadline notifications: {e}")


@shared_task
def create_task_assigned_notification(tache_id, user_id):
    """
    Crée une notification quand un utilisateur est assigné à une tâche

    Args:
        tache_id: ID de la tâche
        user_id: ID de l'utilisateur assigné
    """
    try:
        tache = Tache.objects.select_related('projet').get(id=tache_id)
        user = User.objects.get(id=user_id)

        # Vérifier si notification déjà créée
        if not Notification.objects.filter(
            user=user,
            tache=tache,
            type='task_assigned'
        ).exists():
            deadline_text = tache.deadline.strftime('%d/%m') if tache.deadline else 'Sans deadline'
            Notification.objects.create(
                user=user,
                type='task_assigned',
                titre=f"Nouvelle tâche assignée",
                message=f"{tache.titre} • {deadline_text}",
                tache=tache,
                projet=tache.projet
            )
            logger.info(f"📋 Created task assignment notification for user {user.username} - task {tache.titre}")

    except Exception as e:
        logger.error(f"❌ Failed to create task assignment notification: {e}")


@shared_task
def create_project_assigned_notification(projet_id, user_id):
    """
    Crée une notification quand un utilisateur est assigné à un projet

    Args:
        projet_id: ID du projet
        user_id: ID de l'utilisateur assigné
    """
    try:
        projet = Projet.objects.get(id=projet_id)
        user = User.objects.get(id=user_id)

        # Vérifier si notification déjà créée
        if not Notification.objects.filter(
            user=user,
            projet=projet,
            type='project_assigned'
        ).exists():
            Notification.objects.create(
                user=user,
                type='project_assigned',
                titre=f"Nouveau projet assigné",
                message=f"{projet.titre} • {projet.get_type_display()}",
                projet=projet
            )
            logger.info(f"🎯 Created project assignment notification for user {user.username} - project {projet.titre}")

    except Exception as e:
        logger.error(f"❌ Failed to create project assignment notification: {e}")
