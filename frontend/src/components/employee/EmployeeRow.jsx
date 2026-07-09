import { Icons } from '../common/Icons';
import { AVATAR_COLORS, DEPT_MAP, formatSalary, getInitials } from '../../utils/constants';

function EmployeeRow({ employee, index, onEdit, onDelete, canEdit = true, canDelete = true }) {
  return (
    <tr
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <td>
        <div className="employee-cell">
          <div
            className="employee-avatar"
            style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
          >
            {getInitials(employee.name)}
          </div>
          <div>
            <div className="employee-name">{employee.name}</div>
            <div className="employee-email">{employee.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span className="department-badge">
          {DEPT_MAP[employee.department_id] || `Dept #${employee.department_id}`}
        </span>
      </td>
      <td>
        <span className="salary-text">{formatSalary(employee.salary)}</span>
      </td>
      <td>
        <span className={`status-badge ${employee.status}`}>
          <span className="status-dot" />
          {employee.status}
        </span>
      </td>
      <td>{employee.phone}</td>
      {(canEdit || canDelete) && (
        <td style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-flex', gap: '8px' }}>
            {canEdit && (
              <button
                className="action-btn-edit"
                onClick={() => onEdit(employee.id)}
                title="Edit Employee"
                type="button"
              >
                <Icons.Edit />
              </button>
            )}
            {canDelete && (
              <button
                className="action-btn-delete"
                onClick={() => onDelete(employee)}
                title="Delete Employee"
                type="button"
              >
                <Icons.Trash />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

export default EmployeeRow;
