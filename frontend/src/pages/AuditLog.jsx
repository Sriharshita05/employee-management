import { useCallback, useEffect, useRef, useState } from 'react';
import Pagination from '../components/common/Pagination';
import AuditLogTable from '../components/audit/AuditLogTable';
import { fetchAuditLogs } from '../services/auditService';

const ENTITY_OPTIONS = [
  { value: '', label: 'All records' },
  { value: 'Employee', label: 'Employees' },
  { value: 'Department', label: 'Departments' },
  { value: 'Attendance', label: 'Attendance' },
  { value: 'LeaveRequest', label: 'Leave requests' },
  { value: 'User', label: 'User accounts' },
];

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
];

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 25, total: 0 });
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ignore responses from superseded requests when filters change quickly.
  const latestRequest = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuditLogs({
        entity: entity || undefined,
        action: action || undefined,
        page,
      });
      if (requestId !== latestRequest.current) return;
      setLogs(res.data);
      setMeta(res.meta);
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      console.error('Failed to fetch audit log:', err);
      setError(err.response?.data?.message || 'Failed to load the audit log.');
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [entity, action, page]);

  useEffect(() => {
    load();
  }, [load]);

  const changeEntity = (value) => {
    setEntity(value);
    setPage(1);
  };

  const changeAction = (value) => {
    setAction(value);
    setPage(1);
  };

  return (
    <div className="content-section animate-fade-in-up">
      <div className="content-section-header">
        <div>
          <div className="content-section-title">Audit Log</div>
          <div className="content-section-subtitle">
            A record of who created, changed or deleted data, and when
          </div>
        </div>
        <div className="content-section-actions">
          <select
            className="form-input"
            aria-label="Filter by record type"
            value={entity}
            onChange={(e) => changeEntity(e.target.value)}
          >
            {ENTITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="form-input"
            aria-label="Filter by action"
            value={action}
            onChange={(e) => changeAction(e.target.value)}
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AuditLogTable logs={logs} loading={loading} error={error} onRetry={load} />

      {!loading && !error && (
        <Pagination
          currentPage={page}
          totalPages={meta.last_page}
          totalItems={meta.total}
          pageSize={meta.per_page}
          onPageChange={setPage}
          itemLabel="entries"
        />
      )}
    </div>
  );
}

export default AuditLog;
