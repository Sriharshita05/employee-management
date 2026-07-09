import { Icons } from '../common/Icons';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { ROLE_LABELS, ROLES } from '../../utils/permissions';

const ROLE_OPTIONS = Object.values(ROLES).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

function UserTable({ users, loading, error, onRetry, currentUserId, onRoleChange, onDelete }) {
  if (loading) {
    return <Loader text="Loading users…" />;
  }

  if (error) {
    return (
      <EmptyState
        icon={<Icons.AlertTriangle />}
        message={error}
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  if (users.length === 0) {
    return <EmptyState icon={<Icons.Search />} message="No user accounts yet." />;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th style={{ textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.name}</td>
            <td>{u.email}</td>
            <td>
              <select
                className="form-input"
                style={{ width: '160px' }}
                value={u.role}
                onChange={(e) => onRoleChange(u.id, e.target.value)}
                disabled={u.id === currentUserId}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </td>
            <td style={{ textAlign: 'right' }}>
              <button
                className="action-btn-delete"
                type="button"
                title="Remove user"
                onClick={() => onDelete(u.id)}
                disabled={u.id === currentUserId}
              >
                <Icons.Trash />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;
