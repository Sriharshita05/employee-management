import { useMemo, useState } from 'react';
import { Icons } from '../components/common/Icons';
import Button from '../components/common/Button';
import NotificationList from '../components/notifications/NotificationList';
import { useNotifications } from '../hooks/useNotifications';

function Notifications() {
  const { notifications, unreadCount, loading, error, reload, markOneAsRead, markAllAsRead } =
    useNotifications();
  const [filter, setFilter] = useState('all');

  const visibleNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="content-section animate-fade-in-up">
      <div className="content-section-header">
        <div>
          <div className="content-section-title">Notifications</div>
          <div className="content-section-subtitle">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : 'All caught up'}
          </div>
        </div>
        <div className="content-section-actions">
          <div className="notif-tabs">
            <button
              type="button"
              className={`notif-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`notif-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </button>
          </div>
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Icons.CheckCircle /> Mark all as read
          </Button>
        </div>
      </div>

      <NotificationList
        notifications={visibleNotifications}
        loading={loading}
        error={error}
        onMarkRead={markOneAsRead}
        onRetry={reload}
      />
    </div>
  );
}

export default Notifications;
