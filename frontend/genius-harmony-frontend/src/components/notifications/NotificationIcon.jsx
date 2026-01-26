/**
 * NotificationIcon - Icône de notifications avec badge de count
 *
 * Composant qui affiche :
 * - Icône de cloche
 * - Badge avec nombre de notifications non lues
 * - Dropdown des notifications au clic
 */
import { useState } from 'react';
import useNotifications from '../../hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationIcon({ theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    fetchNotifications,
  } = useNotifications();

  const handleToggle = () => {
    if (!isOpen) {
      // Rafraîchir les notifications quand on ouvre le dropdown
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      if (window.confirm('Supprimer toutes les notifications lues ?')) {
        await deleteAllRead();
      }
    } catch (err) {
      console.error('Error deleting all read notifications:', err);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        data-notification-icon
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          background: 'none',
          border: `1px solid ${theme.border.medium}`,
          borderRadius: '8px',
          padding: '0.5rem 0.75rem',
          cursor: 'pointer',
          fontSize: '1.3rem',
          transition: 'all 0.2s',
          backgroundColor: isOpen ? theme.bg.hover : theme.bg.tertiary,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '44px',
          minHeight: '44px',
        }}
        title={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
        aria-label={`Notifications (${unreadCount} non lues)`}
      >
        {/* Icône de cloche */}
        <span
          style={{
            display: 'inline-block',
            transform: isHovered ? 'rotate(15deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        >
          🔔
        </span>

        {/* Badge avec le nombre de notifications non lues */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: theme.colors.danger,
              color: theme.text.inverse,
              borderRadius: '10px',
              padding: '0.15rem 0.4rem',
              fontSize: '0.7rem',
              fontWeight: '700',
              lineHeight: '1',
              minWidth: '20px',
              textAlign: 'center',
              boxShadow: theme.shadow.sm,
              animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des notifications */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
          onDeleteAllRead={handleDeleteAllRead}
          onClose={() => setIsOpen(false)}
          theme={theme}
        />
      )}

      {/* Animation pulse pour le badge */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.9;
            }
          }
        `}
      </style>
    </div>
  );
}
