"""
Webhooks pour recevoir les notifications d'Odoo

Odoo appelle ces endpoints quand des événements se produisent
(deadlines, assignations, etc.)
"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth import get_user_model

from core.models import Notification, Projet, Tache

User = get_user_model()
logger = logging.getLogger(__name__)


def verify_odoo_token(request):
    """
    Vérifie que la requête vient bien d'Odoo

    Utilise un token secret partagé entre Odoo et Django
    """
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    expected_token = settings.ODOO_WEBHOOK_SECRET

    if not expected_token:
        logger.warning("⚠️ ODOO_WEBHOOK_SECRET not configured")
        return False

    return token == expected_token


@api_view(['POST'])
@permission_classes([AllowAny])
def odoo_deadline_notification(request):
    """
    Reçoit les notifications de deadline depuis Odoo

    Supporte deux formats :
    1. Format personnalisé : {"task_id": 123, "type": "deadline_3days", "users": [...]}
    2. Format Odoo Studio : {"_id": 123, "_model": "project.task"} + ?type=deadline_3days en query param
    """
    # Vérifier le token de sécurité
    if not verify_odoo_token(request):
        logger.warning("❌ Unauthorized webhook call from Odoo")
        return Response(
            {"error": "Unauthorized"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        data = request.data

        # Détecter le format : personnalisé ou Odoo Studio
        if 'task_id' in data:
            # Format personnalisé
            odoo_task_id = data.get('task_id')
            notification_type = data.get('type')
            odoo_user_ids = data.get('users', [])
            odoo_manager_id = data.get('project_manager')
        else:
            # Format Odoo Studio par défaut
            odoo_task_id = data.get('_id') or data.get('id')
            notification_type = request.GET.get('type', 'deadline_notification')

            # Récupérer la tâche depuis Odoo pour obtenir les utilisateurs
            from core.odoo_gateway import odoo_gateway
            try:
                odoo_task = odoo_gateway._odoo.env['project.task'].browse([odoo_task_id])
                if odoo_task.exists():
                    odoo_user_ids = odoo_task.user_ids.mapped('partner_id').ids
                    odoo_manager_id = odoo_task.project_id.user_id.partner_id.id if odoo_task.project_id.user_id else None
                else:
                    odoo_user_ids = []
                    odoo_manager_id = None
            except Exception as e:
                logger.warning(f"⚠️ Could not fetch task details from Odoo: {e}")
                odoo_user_ids = []
                odoo_manager_id = None

        logger.info(f"📥 Received deadline notification from Odoo: task {odoo_task_id}, type {notification_type}")

        # Trouver la tâche Django correspondante
        try:
            tache = Tache.objects.get(odoo_task_id=odoo_task_id)
        except Tache.DoesNotExist:
            logger.error(f"❌ Task not found in Django: odoo_task_id={odoo_task_id}")
            return Response(
                {"error": "Task not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Messages selon le type
        message_map = {
            'deadline_3days': f"{tache.titre} • {tache.deadline.strftime('%d/%m')}",
            'deadline_1day': f"{tache.titre} • Échéance demain",
            'deadline_today': f"{tache.titre} • À terminer aujourd'hui",
            'deadline_overdue': f"{tache.titre} • Retard",
        }

        titre_map = {
            'deadline_3days': "Deadline dans 3 jours",
            'deadline_1day': "Deadline demain",
            'deadline_today': "Deadline AUJOURD'HUI",
            'deadline_overdue': "Tâche en retard",
        }

        message = message_map.get(notification_type, tache.titre)
        titre = titre_map.get(notification_type, "Notification")

        # Créer les notifications pour les utilisateurs assignés
        created_count = 0
        all_user_ids = set(odoo_user_ids)
        if odoo_manager_id:
            all_user_ids.add(odoo_manager_id)

        for odoo_user_id in all_user_ids:
            # Trouver l'utilisateur Django correspondant
            try:
                profile = tache.projet.membres.filter(
                    profile__odoo_partner_id=odoo_user_id
                ).first()

                if not profile:
                    # Essayer le chef de projet
                    if tache.projet.chef_projet and tache.projet.chef_projet.profile.odoo_partner_id == odoo_user_id:
                        profile = tache.projet.chef_projet

                if profile:
                    # Vérifier si notification déjà créée aujourd'hui
                    from django.utils import timezone
                    today = timezone.now().date()

                    if not Notification.objects.filter(
                        user=profile,
                        tache=tache,
                        type=notification_type,
                        created_at__date=today
                    ).exists():
                        Notification.objects.create(
                            user=profile,
                            type=notification_type,
                            titre=titre,
                            message=message,
                            tache=tache,
                            projet=tache.projet
                        )
                        created_count += 1
                        logger.info(f"✅ Created notification for user {profile.username}")

            except Exception as e:
                logger.error(f"❌ Failed to create notification for odoo_user_id {odoo_user_id}: {e}")

        return Response({
            "success": True,
            "notifications_created": created_count
        })

    except Exception as e:
        logger.error(f"❌ Failed to process Odoo webhook: {e}", exc_info=True)
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def odoo_task_assigned(request):
    """
    Reçoit les notifications d'assignation de tâche depuis Odoo

    Payload attendu:
    {
        "task_id": 123,      # ID Odoo de la tâche
        "user_id": 5,        # ID Odoo de l'utilisateur assigné
    }
    """
    if not verify_odoo_token(request):
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        data = request.data
        odoo_task_id = data.get('task_id')
        odoo_user_id = data.get('user_id')

        logger.info(f"📥 Received task assignment from Odoo: task {odoo_task_id}, user {odoo_user_id}")

        # Trouver la tâche et l'utilisateur
        tache = Tache.objects.get(odoo_task_id=odoo_task_id)
        user = User.objects.get(profile__odoo_partner_id=odoo_user_id)

        # Créer la notification
        if not Notification.objects.filter(
            user=user,
            tache=tache,
            type='task_assigned'
        ).exists():
            deadline_text = tache.deadline.strftime('%d/%m') if tache.deadline else 'Sans deadline'
            Notification.objects.create(
                user=user,
                type='task_assigned',
                titre="Nouvelle tâche assignée",
                message=f"{tache.titre} • {deadline_text}",
                tache=tache,
                projet=tache.projet
            )
            logger.info(f"✅ Created task assignment notification for user {user.username}")

        return Response({"success": True})

    except Exception as e:
        logger.error(f"❌ Failed to process task assignment: {e}", exc_info=True)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
