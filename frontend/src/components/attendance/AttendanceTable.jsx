import { Icons } from '../common/Icons';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import SortableTh from '../common/SortableTh';
import AttendanceRow from './AttendanceRow';

function AttendanceTable({
  records,
  loading,
  error,
  savingId,
  onSetStatus,
  onClearStatus,
  onRetry,
  sortState,
  onSort,
  readOnly = false,
}) {
  if (loading) {
    return <Loader text="Loading attendance…" />;
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

  if (records.length === 0) {
    return <EmptyState icon={<Icons.Search />} message="No employees match your search." />;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <SortableTh sortKey="name" sortState={sortState} onSort={onSort}>
            Employee
          </SortableTh>
          <SortableTh sortKey="department" sortState={sortState} onSort={onSort}>
            Department
          </SortableTh>
          <SortableTh sortKey="status" sortState={sortState} onSort={onSort}>
            Status
          </SortableTh>
          <th>Check In</th>
          <th>Check Out</th>
          {!readOnly && <th style={{ textAlign: 'right' }}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {records.map((record, i) => (
          <AttendanceRow
            key={record.employee_id}
            record={record}
            index={i}
            savingId={savingId}
            onSetStatus={onSetStatus}
            onClearStatus={onClearStatus}
            readOnly={readOnly}
          />
        ))}
      </tbody>
    </table>
  );
}

export default AttendanceTable;
