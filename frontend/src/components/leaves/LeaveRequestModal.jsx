import { useEffect, useState } from 'react';
import { Icons } from '../common/Icons';
import Button from '../common/Button';
import Input from '../common/Input';
import { LEAVE_TYPE_OPTIONS } from '../../utils/constants';
import { fetchLeaveBalance } from '../../services/leaveService';

function BalanceHint({ employeeId, leaveType, startDate }) {
  const [balance, setBalance] = useState(null);
  const year = startDate ? Number(startDate.slice(0, 4)) : new Date().getFullYear();

  useEffect(() => {
    if (!employeeId) return undefined;

    let cancelled = false;
    fetchLeaveBalance(employeeId, year)
      .then((data) => {
        if (!cancelled) setBalance(data.balances);
      })
      .catch(() => {
        if (!cancelled) setBalance(null);
      });

    return () => {
      cancelled = true;
    };
  }, [employeeId, year]);

  if (!employeeId || !balance) return null;

  const entry = balance.find((b) => b.leave_type === leaveType);
  if (!entry) return null;

  return (
    <div className="leave-balance-hint">
      {entry.remaining === null
        ? `No limit on ${leaveType} leave.`
        : `${entry.remaining} of ${entry.allowance} ${leaveType} leave days remaining in ${year}.`}
    </div>
  );
}

function LeaveRequestModal({
  isOpen,
  employees,
  formData,
  errors,
  submitting,
  onChange,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null;

  const employeeOptions = [
    { value: '', label: 'Select an employee…' },
    ...employees.map((e) => ({ value: String(e.id), label: e.name })),
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">New Leave Request</span>
          <button className="modal-close" onClick={onClose} type="button">
            <Icons.X />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <Input
                label="Employee"
                name="employee_id"
                as="select"
                options={employeeOptions}
                value={formData.employee_id}
                onChange={(e) => onChange('employee_id', e.target.value)}
                error={errors.employee_id}
                fullWidth
              />
              <Input
                label="Leave Type"
                name="leave_type"
                as="select"
                options={LEAVE_TYPE_OPTIONS}
                value={formData.leave_type}
                onChange={(e) => onChange('leave_type', e.target.value)}
                error={errors.leave_type}
                fullWidth
              />
              <Input
                label="Start Date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => onChange('start_date', e.target.value)}
                error={errors.start_date}
              />
              <Input
                label="End Date"
                name="end_date"
                type="date"
                min={formData.start_date || undefined}
                value={formData.end_date}
                onChange={(e) => onChange('end_date', e.target.value)}
                error={errors.end_date}
              />
              <Input
                label="Reason (optional)"
                name="reason"
                as="textarea"
                rows={3}
                maxLength={500}
                value={formData.reason}
                onChange={(e) => onChange('reason', e.target.value)}
                error={errors.reason}
                fullWidth
              />
            </div>
            <BalanceHint
              key={`${formData.employee_id}-${formData.start_date.slice(0, 4)}`}
              employeeId={formData.employee_id}
              leaveType={formData.leave_type}
              startDate={formData.start_date}
            />
          </div>
          <div className="modal-footer">
            <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveRequestModal;
