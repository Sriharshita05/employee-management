import { ATTENDANCE_STATUS_OPTIONS } from '../../utils/constants';

function AttendanceStatusPills({ status, saving, onSelect, readOnly = false }) {
  return (
    <div className="status-pills">
      {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={saving || readOnly}
          className={`status-pill ${opt.value} ${status === opt.value ? 'selected' : ''}`}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default AttendanceStatusPills;
