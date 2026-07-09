import { Icons } from '../common/Icons';
import { timeAgo } from '../../utils/constants';

const TYPE_ICON = {
  new_hire: <Icons.Users />,
  attendance: <Icons.Calendar />,
  department: <Icons.Building />,
};

function NotificationItem({ notification, onMarkRead }) {
  return (
    <div className={`notif-item ${notification.read ? '' : 'unread'}`}>
      <div className={`notif-icon-wrap ${notification.type}`}>
        {TYPE_ICON[notification.type] || <Icons.Bell />}
      </div>
      <div className="notif-body">
        <div className="notif-title-row">
          <span className="notif-title">{notification.title}</span>
          {!notification.read && <span className="notif-unread-dot" />}
        </div>
        <div className="notif-message">{notification.message}</div>
        <div className="notif-time">{timeAgo(notification.timestamp)}</div>
      </div>
      {!notification.read && (
        <button
          className="notif-mark-read"
          onClick={() => onMarkRead(notification.id)}
          title="Mark as read"
          type="button"
        >
          <Icons.Check />
        </button>
      )}
    </div>
  );
}

export default NotificationItem;
