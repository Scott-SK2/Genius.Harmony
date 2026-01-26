/**
 * NotificationItem - Composant pour afficher une notification individuelle
 *
 * Props:
 * - notification: objet notification
 * - onMarkAsRead: callback pour marquer comme lue
 * - onDelete: callback pour supprimer
 * - theme: objet theme
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function NotificationItem({ notification, onMarkAsRead, onDelete, theme }) {
  const [isHovered, setIsHovered] = useState(false);

  // Obtenir l'emoji basé sur le type
  const getTypeEmoji = (type) => {
    const emojiMap = {
      'deadline_3days': '📅',
      'deadline_1day': '⚠️',
      'deadline_today': '🔴',
      'deadline_overdue': '❌',
      'task_assigned': '📋',
      'project_assigned': '🎯',
      'project_leader_assigned': '👔',
    };
    return emojiMap[type] || '📢';
  };

  // Obtenir la couleur de la notification
  const getTypeColor = (type) => {
    const colorMap = {
      'deadline_3days': '#3b82f6', // blue
      'deadline_1day': '#f59e0b', // amber
      'deadline_today': '#ef4444', // red
      'deadline_overdue': '#dc2626', // dark red
      'task_assigned': '#8b5cf6', // purple
      'project_assigned': '#10b981', // green
      'project_leader_assigned': '#0ea5e9', // sky blue
    };
    return colorMap[type] || theme.colors.primary;
  };

  // Formater la date relative
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  // Obtenir le lien vers la ressource
  const getLink = () => {
    // Si c'est une notification de tâche, utiliser le projet de la tâche
    if (notification.tache && notification.tache_projet_id) {
      return `/projets/${notification.tache_projet_id}`;
    }
    // Si c'est une notification de projet, utiliser l'ID du projet
    if (notification.projet) {
      return `/projets/${notification.projet}`;
    }
    return null;
  };

  const link = getLink();
  const typeColor = getTypeColor(notification.type);
  const emoji = getTypeEmoji(notification.type);

  const handleMarkAsRead = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(notification.id);
  };

  const handleClick = () => {
    // Marquer comme lue lors du clic sur la notification
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const content = (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '1rem',
        borderBottom: `1px solid ${theme.border.light}`,
        backgroundColor: notification.is_read
          ? theme.bg.secondary
          : theme.bg.tertiary,
        cursor: link ? 'pointer' : 'default',
        transition: 'all 0.2s',
        position: 'relative',
        ...(isHovered && {
          backgroundColor: theme.bg.hover,
        }),
      }}
    >
      {/* Indicateur non lu */}
      {!notification.is_read && (
        <div
          style={{
            position: 'absolute',
            left: '0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: typeColor,
          }}
        />
      )}

      <div style={{ marginLeft: notification.is_read ? '0' : '1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.25rem',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: theme.text.primary,
                }}
              >
                {notification.titre}
              </span>
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                color: theme.text.secondary,
                lineHeight: '1.4',
              }}
            >
              {notification.message}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.25rem', marginLeft: '0.5rem' }}>
            {!notification.is_read && (
              <button
                onClick={handleMarkAsRead}
                title="Marquer comme lue"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  padding: '0.25rem',
                  opacity: 0.6,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.opacity = '1')}
                onMouseLeave={(e) => (e.target.style.opacity = '0.6')}
              >
                ✓
              </button>
            )}
            <button
              onClick={handleDelete}
              title="Supprimer"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '0.25rem',
                opacity: 0.6,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '1')}
              onMouseLeave={(e) => (e.target.style.opacity = '0.6')}
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Footer - Metadata */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: theme.text.tertiary,
            marginTop: '0.5rem',
          }}
        >
          <span>{getRelativeTime(notification.created_at)}</span>
          {notification.projet_titre && (
            <>
              <span>•</span>
              <span>📁 {notification.projet_titre}</span>
            </>
          )}
          {notification.tache_titre && (
            <>
              <span>•</span>
              <span>📋 {notification.tache_titre}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Wrapper avec Link si on a une destination
  if (link) {
    return (
      <Link
        to={link}
        onClick={handleClick}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        {content}
      </Link>
    );
  }

  return content;
}
