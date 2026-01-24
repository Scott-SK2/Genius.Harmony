/**
 * NotificationDropdown - Panel de notifications
 *
 * Props:
 * - notifications: array de notifications
 * - isLoading: boolean
 * - onMarkAsRead: callback
 * - onMarkAllAsRead: callback
 * - onDelete: callback
 * - onDeleteAllRead: callback
 * - onClose: callback pour fermer le dropdown
 * - theme: objet theme
 */
import { useRef, useEffect } from 'react';
import NotificationItem from './NotificationItem';

export default function NotificationDropdown({
  notifications,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAllRead,
  onClose,
  theme,
}) {
  const dropdownRef = useRef(null);

  // Fermer quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Vérifier que le clic n'est pas sur l'icône de notification
        const notificationIcon = event.target.closest('[data-notification-icon]');
        if (!notificationIcon) {
          onClose();
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const hasUnread = unreadNotifications.length > 0;
  const hasRead = notifications.some(n => n.is_read);

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 0.5rem)',
        right: 0,
        width: '420px',
        maxWidth: '95vw',
        maxHeight: '600px',
        backgroundColor: theme.bg.secondary,
        border: `1px solid ${theme.border.medium}`,
        borderRadius: '12px',
        boxShadow: theme.shadow.lg,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: `1px solid ${theme.border.light}`,
          backgroundColor: theme.bg.tertiary,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: theme.text.primary }}>
            🔔 Notifications
          </h3>
          {hasUnread && (
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: theme.text.secondary }}>
              {unreadNotifications.length} non lue{unreadNotifications.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Actions header */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {hasUnread && (
            <button
              onClick={onMarkAllAsRead}
              title="Tout marquer comme lu"
              style={{
                background: 'none',
                border: `1px solid ${theme.border.medium}`,
                borderRadius: '6px',
                padding: '0.4rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '500',
                color: theme.text.secondary,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.bg.hover;
                e.target.style.color = theme.text.primary;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = theme.text.secondary;
              }}
            >
              ✓ Tout marquer
            </button>
          )}
          {hasRead && (
            <button
              onClick={onDeleteAllRead}
              title="Supprimer toutes les notifications lues"
              style={{
                background: 'none',
                border: `1px solid ${theme.border.medium}`,
                borderRadius: '6px',
                padding: '0.4rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '500',
                color: theme.text.secondary,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.bg.hover;
                e.target.style.color = theme.colors.danger;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = theme.text.secondary;
              }}
            >
              🗑️ Lues
            </button>
          )}
        </div>
      </div>

      {/* Body - Liste des notifications */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '500px',
        }}
      >
        {isLoading ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: theme.text.secondary,
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <p>Chargement...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              color: theme.text.secondary,
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.5rem', color: theme.text.primary }}>
              Aucune notification
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              Vous êtes à jour !
            </p>
          </div>
        ) : (
          <>
            {/* Notifications non lues d'abord */}
            {unreadNotifications.length > 0 && (
              <>
                {unreadNotifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                    theme={theme}
                  />
                ))}
              </>
            )}

            {/* Séparateur si on a des lues et des non lues */}
            {hasUnread && hasRead && (
              <div
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: theme.bg.tertiary,
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: theme.text.tertiary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Déjà lues
              </div>
            )}

            {/* Notifications lues */}
            {notifications
              .filter(n => n.is_read)
              .map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                  theme={theme}
                />
              ))}
          </>
        )}
      </div>
    </div>
  );
}
