import { Icons } from '../common/Icons';
import { AVATAR_COLORS, getInitials } from '../../utils/constants';
import AttendanceStatusPills from './AttendanceStatusPills';

function AttendanceRow({ record, index, savingId, onSetStatus, onClearStatus, readOnly = false }) {
  const saving = savingId === record.employee_id;

  return (
    <tr className="animate-fade-in-up" style={{ animationDelay: `${index * 30}ms` }}>
      <td>
        <div className="employee-cell">
          <div
            className="employee-avatar"
            style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
          >
            {getInitials(record.employee_name)}
          </div>
          <div>
            <div className="employee-name">{record.employee_name}</div>
          </div>
        </div>
      </td>
      <td>
        <span className="department-badge">{record.department}</span>
      </td>
      <td>
        <AttendanceStatusPills
          status={record.status}
          saving={saving}
          readOnly={readOnly}
          onSelect={(status) => onSetStatus(record.employee_id, status)}
        />
      </td>
      <td>{record.check_in || '—'}</td>
      <td>{record.check_out || '—'}</td>
      {!readOnly && (
        <td style={{ textAlign: 'right' }}>
          <button
            className="action-btn-delete"
            onClick={() => onClearStatus(record.employee_id, record.attendance_id)}
            disabled={!record.attendance_id || saving}
            title="Clear status"
            type="button"
          >
            <Icons.X />
          </button>
        </td>
      )}
    </tr>
  );
}

export default AttendanceRow;
