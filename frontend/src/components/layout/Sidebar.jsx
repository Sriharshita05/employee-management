import { NavLink } from 'react-router-dom';
import { Icons } from '../common/Icons';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/constants';
import { ROLES, ROLE_LABELS } from '../../utils/permissions';

// Each item declares which roles may see it. Omitting `roles` means every
// authenticated role can see the link (e.g. Dashboard, Attendance).
const navItems = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: <Icons.Dashboard /> },
  { id: 'employees', path: '/employees', label: 'Employees', icon: <Icons.Users /> },
  {
    id: 'departments',
    path: '/departments',
    label: 'Departments',
    icon: <Icons.Building />,
    roles: [ROLES.ADMIN, ROLES.HR],
  },
  { id: 'attendance', path: '/attendance', label: 'Attendance', icon: <Icons.Calendar /> },
  {
    id: 'reports',
    path: '/reports',
    label: 'Reports',
    icon: <Icons.BarChart />,
    roles: [ROLES.ADMIN],
  },
  {
    id: 'users',
    path: '/users',
    label: 'Manage Users',
    icon: <Icons.UserCheck />,
    roles: [ROLES.ADMIN],
  },
];

const bottomItems = [
  { id: 'docs', path: '/documentation', label: 'Documentation', icon: <Icons.FileText /> },
  { id: 'help', path: '/help', label: 'Help & Support', icon: <Icons.HelpCircle /> },
  { id: 'notifications', path: '/notifications', label: 'Notifications', icon: <Icons.Bell /> },
  { id: 'settings', path: '/settings', label: 'Settings', icon: <Icons.Settings /> },
];

function Sidebar({ isOpen, onClose }) {
  const { settings } = useSettings();
  const { role } = useAuth();

  const visibleNavItems = navItems.filter((item) => !item.roles || item.roles.includes(role));

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">EM</div>
          <span className="sidebar-brand-text">EmpManage</span>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-title">Main Menu</span>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={handleNavClick}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <span className="sidebar-section-title" style={{ marginTop: '12px' }}>
            Support
          </span>
          {bottomItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={handleNavClick}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{getInitials(settings.profile.name)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{settings.profile.name}</div>
            <div className="sidebar-user-role">
              {role ? ROLE_LABELS[role] : settings.profile.role}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
