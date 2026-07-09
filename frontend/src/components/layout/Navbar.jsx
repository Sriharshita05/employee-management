import { useLocation, useNavigate } from 'react-router-dom';
import SearchBar from '../employee/SearchBar';
import { Icons } from '../common/Icons';
import { ROUTE_TITLES } from '../../utils/constants';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../context/AuthContext';

function getPageTitle(pathname) {
  if (pathname.includes('/employees/') && pathname.endsWith('/edit')) {
    return ROUTE_TITLES.edit;
  }
  if (pathname.startsWith('/employees')) return ROUTE_TITLES.employees;
  if (pathname.startsWith('/departments')) return ROUTE_TITLES.departments;
  if (pathname.startsWith('/attendance')) return ROUTE_TITLES.attendance;
  if (pathname.startsWith('/reports')) return ROUTE_TITLES.reports;
  if (pathname.startsWith('/settings')) return ROUTE_TITLES.settings;
  if (pathname.startsWith('/documentation')) return ROUTE_TITLES.docs;
  if (pathname.startsWith('/help')) return ROUTE_TITLES.help;
  if (pathname.startsWith('/notifications')) return ROUTE_TITLES.notifications;
  return ROUTE_TITLES.dashboard;
}

function Navbar({ onMenuClick, searchQuery, onSearchChange }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pageTitle = getPageTitle(pathname);
  const { unreadCount } = useNotifications();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-burger" onClick={onMenuClick} type="button">
          <Icons.Menu />
        </button>
        <div className="navbar-breadcrumb">
          <span>Home</span>
          <Icons.ChevronRight />
          <span className="navbar-breadcrumb-current">{pageTitle}</span>
        </div>
      </div>

      <div className="navbar-right">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        <button
          className="navbar-icon-btn"
          type="button"
          onClick={() => navigate('/notifications')}
          title={unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'Notifications'}
        >
          <Icons.Bell />
          {unreadCount > 0 && <span className="navbar-notification-dot" />}
        </button>
        {user && (
          <button
            className="navbar-icon-btn navbar-logout-btn"
            type="button"
            onClick={handleLogout}
            title={`Log out (${user.email})`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;
