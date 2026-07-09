import { useMemo, useState } from 'react';
import { Icons } from '../components/common/Icons';

const SECTIONS = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: <Icons.Zap />,
    keywords: 'overview intro setup start',
    content: (
      <>
        <h3>Getting Started</h3>
        <p>
          EmpManage is a centralized system for managing employee data, departments,
          attendance, and workforce reports. Use the sidebar to move between modules —
          each one is backed by live data from the API, so changes you make show up
          everywhere instantly.
        </p>
        <ul>
          <li><strong>Dashboard</strong> — a quick snapshot of your workforce.</li>
          <li><strong>Employees</strong> — add, edit, and search employee records.</li>
          <li><strong>Departments</strong> — organize employees into teams.</li>
          <li><strong>Attendance</strong> — mark daily attendance per employee.</li>
          <li><strong>Reports</strong> — visualize headcount, salary, and attendance trends.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'employees',
    label: 'Managing Employees',
    icon: <Icons.Users />,
    keywords: 'employee add edit delete search directory',
    content: (
      <>
        <h3>Managing Employees</h3>
        <p>
          The Employees page lists everyone in your organization. Use the search bar in
          the top navigation to filter by name, ID, email, or department.
        </p>
        <ul>
          <li>Click <strong>Add Employee</strong> to create a new record — name, email, phone, department, salary, and status are required.</li>
          <li>Click the edit icon on any row to update an employee's details.</li>
          <li>Deleting an employee removes their record and any associated attendance history.</li>
          <li>Status can be <strong>Active</strong>, <strong>Inactive</strong>, or <strong>Terminated</strong> — this affects whether they show up on the Attendance page.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'departments',
    label: 'Departments',
    icon: <Icons.Building />,
    keywords: 'department team add edit delete',
    content: (
      <>
        <h3>Departments</h3>
        <p>
          Departments group employees into teams. Each department card shows the number
          of employees assigned and total salary spend for that team.
        </p>
        <ul>
          <li>Click <strong>Add Department</strong> to create a new team with an optional description.</li>
          <li>You can't delete a department while employees are still assigned to it — reassign or remove them first.</li>
          <li>Employee counts and salary totals update automatically as you add or edit employees.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: <Icons.Calendar />,
    keywords: 'attendance present absent late leave mark',
    content: (
      <>
        <h3>Attendance</h3>
        <p>
          Pick a date to view and mark attendance for every active employee. Click a
          status pill — <strong>Present</strong>, <strong>Late</strong>, <strong>Absent</strong>,
          or <strong>On Leave</strong> — to mark that employee instantly.
        </p>
        <ul>
          <li>The summary cards at the top show live counts for the selected date.</li>
          <li><strong>Mark All Present</strong> fills in a status for anyone who hasn't been marked yet.</li>
          <li>Click the X on a row to clear a status and mark it as unrecorded again.</li>
          <li>You can only mark attendance for today or earlier — future dates are disabled.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <Icons.BarChart />,
    keywords: 'reports export csv chart salary trend',
    content: (
      <>
        <h3>Reports</h3>
        <p>
          Reports gives you a real-time view of headcount, salary spend, department
          distribution, and a 7-day attendance trend.
        </p>
        <ul>
          <li>Use <strong>Export CSV</strong> to download a department-by-department breakdown.</li>
          <li>The attendance trend chart is stacked by status so you can spot patterns across the week.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Icons.Bell />,
    keywords: 'notifications alerts unread',
    content: (
      <>
        <h3>Notifications</h3>
        <p>
          The notification bell in the top navigation shows a live count of unread
          alerts, generated from real activity — new hires, employee updates, empty
          departments, and unmarked or absent attendance for the day.
        </p>
        <ul>
          <li>Click a notification's checkmark to mark it as read.</li>
          <li>Use <strong>Mark all as read</strong> to clear everything at once.</li>
          <li>Turn categories on or off from the Notification Preferences section in Settings.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Icons.Settings />,
    keywords: 'settings profile preferences compact reset',
    content: (
      <>
        <h3>Settings</h3>
        <p>
          Settings are stored locally on this device and control your profile display,
          notification preferences, and table density.
        </p>
        <ul>
          <li>Update your name, role, and email under <strong>Profile</strong> — this shows in the sidebar.</li>
          <li>Toggle notification categories on or off under <strong>Notification Preferences</strong>.</li>
          <li>Enable <strong>Compact mode</strong> for denser tables when working with large lists.</li>
          <li><strong>Reset to Defaults</strong> clears your local preferences without touching any employee data.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'shortcuts',
    label: 'Keyboard Shortcuts',
    icon: <Icons.FileText />,
    keywords: 'shortcuts keyboard keys',
    content: (
      <>
        <h3>Keyboard Shortcuts</h3>
        <p>Speed up common actions with these shortcuts while browsing EmpManage.</p>
        <div className="docs-shortcut-row">
          <span>Focus the search bar</span>
          <span className="docs-kbd">⌘ K</span>
        </div>
        <div className="docs-shortcut-row">
          <span>Close a modal or dialog</span>
          <span className="docs-kbd">Esc</span>
        </div>
        <div className="docs-shortcut-row">
          <span>Submit a form</span>
          <span className="docs-kbd">Enter</span>
        </div>
      </>
    ),
  },
];

function Documentation() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const [query, setQuery] = useState('');

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter(
      (s) => s.label.toLowerCase().includes(q) || s.keywords.includes(q)
    );
  }, [query]);

  const activeSection =
    filteredSections.find((s) => s.id === activeId) || filteredSections[0] || SECTIONS[0];

  return (
    <div className="content-section animate-fade-in-up">
      <div className="content-section-header">
        <div>
          <div className="content-section-title">Documentation</div>
          <div className="content-section-subtitle">Guides and reference materials</div>
        </div>
        <div className="content-section-actions">
          <input
            type="text"
            className="form-input"
            style={{ width: '220px' }}
            placeholder="Search docs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="docs-layout">
        <nav className="docs-nav">
          {filteredSections.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`docs-nav-item ${activeSection.id === s.id ? 'active' : ''}`}
              onClick={() => setActiveId(s.id)}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
          {filteredSections.length === 0 && (
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '8px 12px' }}>
              No matching topics.
            </span>
          )}
        </nav>
        <div className="docs-content">{activeSection?.content}</div>
      </div>
    </div>
  );
}

export default Documentation;
