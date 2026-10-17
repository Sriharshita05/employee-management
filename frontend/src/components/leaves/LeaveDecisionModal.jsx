import { useState } from 'react';
import { Icons } from '../common/Icons';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatDateRange } from '../../utils/constants';

/**
 * Confirms an approve/reject decision. A note is optional when approving
 * and required when rejecting, matching the API.
 */
function LeaveDecisionModal({ request, mode, submitting, onClose, onSubmit }) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!request) return null;

  const isReject = mode === 'reject';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReject && !note.trim()) {
      setError('Please give a reason for rejecting this request.');
      return;
    }
    onSubmit(note.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-container-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isReject ? 'Reject Request' : 'Approve Request'}</span>
          <button className="modal-close" onClick={onClose} type="button">
            <Icons.X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="delete-confirm-text" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <strong>{request.employee.name}</strong> — {request.days} working day(s),{' '}
              {formatDateRange(request.start_date, request.end_date)}
              {!isReject && '. Approving marks these days as on leave in attendance.'}
            </p>
            <Input
              label={isReject ? 'Reason (required)' : 'Note (optional)'}
              name="decision_note"
              as="textarea"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setError('');
              }}
              error={error}
              fullWidth
            />
          </div>
          <div className="modal-footer">
            <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant={isReject ? 'danger' : 'primary'} type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isReject ? 'Reject' : 'Approve'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveDecisionModal;
