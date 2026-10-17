import { Icons } from '../common/Icons';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { timeAgo } from '../../utils/constants';

const MAX_FIELDS_SHOWN = 4;

function display(value) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

/**
 * Turns an audit entry into short "field: old → new" lines. Updates show
 * the before and after of each changed field; creates and deletes list the
 * first few stored values.
 */
function summarise(log) {
  const lines = [];

  if (log.action === 'updated') {
    Object.keys(log.new_values ?? {}).forEach((field) => {
      lines.push(`${field}: ${display(log.old_values?.[field])} → ${display(log.new_values[field])}`);
    });
  } else {
    const values = log.action === 'created' ? log.new_values : log.old_values;
    Object.entries(values ?? {})
      .filter(([field]) => field !== 'id')
      .forEach(([field, value]) => lines.push(`${field}: ${display(value)}`));
  }

  return lines;
}

function AuditLogTable({ logs, loading, error, onRetry }) {
  if (loading) {
    return <Loader text="Loading audit log…" />;
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

  if (logs.length === 0) {
    return <EmptyState icon={<Icons.FileText />} message="No audit entries match these filters." />;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>When</th>
          <th>User</th>
          <th>Action</th>
          <th>Record</th>
          <th>Changes</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => {
          const lines = summarise(log);

          return (
            <tr key={log.id}>
              <td title={new Date(log.created_at).toLocaleString()}>{timeAgo(log.created_at)}</td>
              <td>{log.user}</td>
              <td>
                <span className={`status-badge audit-${log.action}`}>
                  <span className="status-dot" />
                  {log.action}
                </span>
              </td>
              <td>
                {log.entity} <span className="employee-email">#{log.entity_id}</span>
              </td>
              <td>
                {lines.slice(0, MAX_FIELDS_SHOWN).map((line) => (
                  <div key={line} className="audit-change">
                    {line}
                  </div>
                ))}
                {lines.length > MAX_FIELDS_SHOWN && (
                  <div className="employee-email">+{lines.length - MAX_FIELDS_SHOWN} more</div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default AuditLogTable;
