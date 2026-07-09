import { Icons } from '../common/Icons';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import SortableTh from '../common/SortableTh';
import EmployeeRow from './EmployeeRow';

function EmployeeTable({
  employees,
  loading,
  error,
  onEdit,
  onDelete,
  onRetry,
  sortState,
  onSort,
  canEdit = true,
  canDelete = true,
}) {
  if (loading) {
    return <Loader text="Loading employees…" />;
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

  if (employees.length === 0) {
    return (
      <EmptyState
        icon={<Icons.Search />}
        message="No employees match your search."
      />
    );
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
          <SortableTh sortKey="salary" sortState={sortState} onSort={onSort}>
            Salary
          </SortableTh>
          <SortableTh sortKey="status" sortState={sortState} onSort={onSort}>
            Status
          </SortableTh>
          <th>Phone</th>
          {(canEdit || canDelete) && <th style={{ textAlign: 'right' }}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {employees.map((emp, i) => (
          <EmployeeRow
            key={emp.id || emp.email}
            employee={emp}
            index={i}
            onEdit={onEdit}
            onDelete={onDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ))}
      </tbody>
    </table>
  );
}

export default EmployeeTable;
