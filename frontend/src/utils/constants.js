export const DEPT_MAP = {
  1: 'Human Resources',
  2: 'Sales',
  3: 'Engineering',
  4: 'Marketing',
  5: 'Finance',
};

export const AVATAR_COLORS = [
  'linear-gradient(135deg, #3b82f6, #60a5fa)',
  'linear-gradient(135deg, #a3522a, #c96f45)',
  'linear-gradient(135deg, #10b981, #34d399)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #c026d3, #e879f9)',
  'linear-gradient(135deg, #ef4444, #f87171)',
  'linear-gradient(135deg, #06b6d4, #22d3ee)',
  'linear-gradient(135deg, #14b8a6, #2dd4bf)',
];

export const DEPARTMENT_OPTIONS = [
  { value: '1', label: 'Human Resources' },
  { value: '2', label: 'Sales' },
  { value: '3', label: 'Engineering' },
  { value: '4', label: 'Marketing' },
  { value: '5', label: 'Finance' },
];

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'terminated', label: 'Terminated' },
];

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'on_leave', label: 'On Leave' },
];

export const ATTENDANCE_STATUS_META = {
  present: { label: 'Present', className: 'present' },
  late: { label: 'Late', className: 'late' },
  absent: { label: 'Absent', className: 'absent' },
  on_leave: { label: 'On Leave', className: 'on-leave' },
};

export const ROUTE_TITLES = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  departments: 'Departments',
  attendance: 'Attendance',
  reports: 'Reports',
  settings: 'Settings',
  docs: 'Documentation',
  help: 'Help & Support',
  notifications: 'Notifications',
  edit: 'Edit Employee',
};

export const INITIAL_EMPLOYEE_FORM = {
  name: '',
  email: '',
  phone: '',
  department_id: '',
  salary: '',
  status: 'active',
};

export function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatSalary(salary) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(salary);
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 18) return 'Afternoon';
  return 'Evening';
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateReadable(dateStr) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
