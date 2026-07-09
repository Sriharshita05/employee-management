import { Icons } from '../common/Icons';
import { formatSalary } from '../../utils/constants';

const COLOR_CLASSES = ['indigo', 'emerald', 'amber', 'pink'];

function DepartmentCard({ department, index, onEdit, onDelete }) {
  const colorClass = COLOR_CLASSES[index % COLOR_CLASSES.length];

  return (
    <div className={`dept-card animate-fade-in-up delay-${(index % 5) + 1}`}>
      <div className="dept-card-top">
        <div className={`stat-icon-wrap ${colorClass}`}>
          <Icons.Building />
        </div>
        <div className="dept-card-actions">
          {onEdit && (
            <button className="action-btn-edit" onClick={() => onEdit(department)} type="button">
              <Icons.Edit />
            </button>
          )}
          {onDelete && (
            <button className="action-btn-delete" onClick={() => onDelete(department)} type="button">
              <Icons.Trash />
            </button>
          )}
        </div>
      </div>

      <div className="dept-card-name">{department.name}</div>
      <div className="dept-card-desc">
        {department.description || 'No description added yet.'}
      </div>

      <div className="dept-card-stats">
        <div className="dept-card-stat">
          <span className="dept-card-stat-value">{department.employee_count ?? 0}</span>
          <span className="dept-card-stat-label">Employees</span>
        </div>
        <div className="dept-card-stat">
          <span className="dept-card-stat-value">
            {formatSalary(department.total_salary || 0)}
          </span>
          <span className="dept-card-stat-label">Salary Spend</span>
        </div>
      </div>
    </div>
  );
}

export default DepartmentCard;
