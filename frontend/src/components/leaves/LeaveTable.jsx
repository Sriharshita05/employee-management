import { Icons } from '../common/Icons';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { formatDateRange, LEAVE_TYPE_OPTIONS } from '../../utils/constants';

const TYPE_LABELS = Object.fromEntries(LEAVE_TYPE_OPTIONS.map((o) => [o.value, o.label]));

function LeaveTable({
  requests,
  loading,
  error,
  actingId,
  canCreate,
  canDecide,
  onRetry,
  onApprove,
  onReject,
  onCancel,
}) {
  if (loading) {
    return <Loader text="Loading leave requests…" />;
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

  if (requests.length === 0) {
    return <EmptyState icon={<Icons.Calendar />} message="No leave requests found." />;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Employee</th>
          <th>Type</th>
          <th>Dates</th>
          <th>Days</th>
          <th>Status</th>
          <th>Requested by</th>
          <th style={{ textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => {
          const isPending = request.status === 'pending';
          const busy = actingId === request.id;

          return (
            <tr key={request.id}>
              <td>
                <div className="employee-name">{request.employee.name}</div>
                <div className="employee-email">{request.employee.department}</div>
              </td>
              <td>{TYPE_LABELS[request.leave_type] ?? request.leave_type}</td>
              <td>
                <div>{formatDateRange(request.start_date, request.end_date)}</div>
                {request.reason && <div className="employee-email">{request.reason}</div>}
              </td>
              <td>{request.days}</td>
              <td>
                <span className={`status-badge ${request.status}`}>
                  <span className="status-dot" />
                  {request.status}
                </span>
                {request.decided_by && (
                  <div className="employee-email" title={request.decision_note || undefined}>
                    by {request.decided_by}
                    {request.decision_note ? ` — “${request.decision_note}”` : ''}
                  </div>
                )}
              </td>
              <td>{request.requested_by ?? '—'}</td>
              <td style={{ textAlign: 'right' }}>
                {isPending && (canDecide || canCreate) && (
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    {canDecide && (
                      <>
                        <button
                          type="button"
                          className="action-btn-edit"
                          title="Approve"
                          disabled={busy}
                          onClick={() => onApprove(request)}
                        >
                          <Icons.Check />
                        </button>
                        <button
                          type="button"
                          className="action-btn-delete"
                          title="Reject"
                          disabled={busy}
                          onClick={() => onReject(request)}
                        >
                          <Icons.X />
                        </button>
                      </>
                    )}
                    {canCreate && (
                      <button
                        type="button"
                        className="action-btn-edit"
                        title="Cancel request"
                        disabled={busy}
                        onClick={() => onCancel(request)}
                      >
                        <Icons.RotateCcw />
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default LeaveTable;
