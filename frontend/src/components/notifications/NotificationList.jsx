import { Icons } from '../common/Icons';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import NotificationItem from './NotificationItem';

function NotificationList({ notifications, loading, error, onMarkRead, onRetry }) {
  if (loading) {
    return <Loader text="Loading notifications…" />;
  }

  if (error) {
    return (
      <EmptyState
        icon={<Icons.AlertTriangle />}
        message={error}
        actionLabel="Retry"
        onAction={onRetry || (() => window.location.reload())}
      />
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState icon={<Icons.Bell />} message="You're all caught up — no notifications here." />
    );
  }

  return (
    <div className="notif-list">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} />
      ))}
    </div>
  );
}

export default NotificationList;
