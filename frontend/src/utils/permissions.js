// ─────────────────────────────────────────────────────────────────────
// Central RBAC permission map.
//
// This is the single source of truth the UI uses to decide what a role
// can see and do. It intentionally mirrors the `role:` middleware rules
// in the Laravel backend (routes/api.php) so the two stay in sync — the
// backend is still the real enforcement point, this just keeps the UI
// from showing controls a user isn't allowed to use.
// ─────────────────────────────────────────────────────────────────────

export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.HR]: 'HR',
  [ROLES.MANAGER]: 'Manager',
};

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  ADD_EMPLOYEE: 'add_employee',
  EDIT_EMPLOYEE: 'edit_employee',
  DELETE_EMPLOYEE: 'delete_employee',
  VIEW_DEPARTMENTS: 'view_departments',
  MANAGE_DEPARTMENTS: 'manage_departments',
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  MARK_ATTENDANCE: 'mark_attendance',
  // Every role can view leave requests. Filing/cancelling is separate from
  // approving/rejecting, mirroring the role middleware on the API.
  CREATE_LEAVE: 'create_leave',
  DECIDE_LEAVE: 'decide_leave',
  VIEW_AUDIT_LOG: 'view_audit_log',
};

// Which permissions each role holds.
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.ADD_EMPLOYEE,
    PERMISSIONS.EDIT_EMPLOYEE,
    PERMISSIONS.DELETE_EMPLOYEE,
    PERMISSIONS.VIEW_DEPARTMENTS,
    PERMISSIONS.MANAGE_DEPARTMENTS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.CREATE_LEAVE,
    PERMISSIONS.DECIDE_LEAVE,
    PERMISSIONS.VIEW_AUDIT_LOG,
  ],
  [ROLES.HR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.ADD_EMPLOYEE,
    PERMISSIONS.EDIT_EMPLOYEE,
    PERMISSIONS.VIEW_DEPARTMENTS,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.CREATE_LEAVE,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.DECIDE_LEAVE,
  ],
};

/**
 * Whether the given role holds the given permission.
 */
export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Whether the given role is one of the allowed roles for a route/section.
 * Passing an empty/undefined array means "any authenticated role".
 */
export function isRoleAllowed(role, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
}
