/**
 * Hook personnalisé pour gérer les notifications
 *
 * Fonctionnalités :
 * - Fetch notifications depuis l'API
 * - Polling automatique toutes les 30 secondes
 * - Marquer comme lues
 * - Supprimer notifications
 * - Compter notifications non lues
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const POLL_INTERVAL = 30000; // 30 secondes

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch toutes les notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications/?limit=50');
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch uniquement le count des non lues
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/unread-count/');
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/mark-read/`);

      // Mettre à jour l'état local
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );

      // Décrémenter le count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/mark-all-read/');

      // Mettre à jour l'état local
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  }, []);

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}/`);

      // Mettre à jour l'état local
      setNotifications(prev => {
        const deleted = prev.find(n => n.id === notificationId);
        if (deleted && !deleted.is_read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, []);

  // Supprimer toutes les notifications lues
  const deleteAllRead = useCallback(async () => {
    try {
      await api.delete('/notifications/delete-all-read/');

      // Mettre à jour l'état local
      setNotifications(prev => prev.filter(n => !n.is_read));
    } catch (err) {
      console.error('Error deleting all read notifications:', err);
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Polling pour les nouvelles notifications
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
      // Si on a le panel ouvert, rafraîchir les notifications complètes
      // Sinon, juste le count pour performance
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  };
}
