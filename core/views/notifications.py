"""
Notification-related views
"""
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from ..models import Notification
from ..serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """
    GET: Liste toutes les notifications de l'utilisateur connecté

    Query params:
    - is_read: 'true', 'false', ou non spécifié (toutes)
    - limit: Nombre de notifications à retourner (défaut: 50)
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(user=user).select_related('tache', 'projet')

        # Filtrer par is_read si spécifié
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            if is_read.lower() == 'true':
                queryset = queryset.filter(is_read=True)
            elif is_read.lower() == 'false':
                queryset = queryset.filter(is_read=False)

        # Limiter le nombre de résultats
        limit = self.request.query_params.get('limit', 50)
        try:
            limit = int(limit)
        except (ValueError, TypeError):
            limit = 50

        return queryset[:limit]


class NotificationDetailView(generics.RetrieveDestroyAPIView):
    """
    GET: Récupère une notification spécifique
    DELETE: Supprime une notification
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # L'utilisateur ne peut voir que ses propres notifications
        return Notification.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, pk):
    """
    POST: Marque une notification comme lue
    """
    try:
        notification = Notification.objects.get(pk=pk, user=request.user)
        notification.mark_as_read()
        return Response({
            'status': 'success',
            'message': 'Notification marquée comme lue'
        }, status=status.HTTP_200_OK)
    except Notification.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Notification non trouvée'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_as_read(request):
    """
    POST: Marque toutes les notifications non lues de l'utilisateur comme lues
    """
    updated = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).update(
        is_read=True,
        read_at=timezone.now()
    )

    return Response({
        'status': 'success',
        'message': f'{updated} notification(s) marquée(s) comme lue(s)',
        'count': updated
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """
    GET: Retourne le nombre de notifications non lues de l'utilisateur
    """
    count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).count()

    return Response({
        'count': count
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_all_read(request):
    """
    DELETE: Supprime toutes les notifications lues de l'utilisateur
    """
    deleted, _ = Notification.objects.filter(
        user=request.user,
        is_read=True
    ).delete()

    return Response({
        'status': 'success',
        'message': f'{deleted} notification(s) supprimée(s)',
        'count': deleted
    }, status=status.HTTP_200_OK)
