import { Icons } from '../common/Icons';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import DepartmentCard from './DepartmentCard';

function DepartmentGrid({ departments, loading, error, onEdit, onDelete, onRetry }) {
  if (loading) {
    return <Loader text="Loading departments…" />;
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

  if (departments.length === 0) {
    return (
      <EmptyState
        icon={<Icons.Search />}
        message="No departments match your search."
      />
    );
  }

  return (
    <div className="dept-grid">
      {departments.map((dept, i) => (
        <DepartmentCard
          key={dept.id}
          department={dept}
          index={i}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default DepartmentGrid;
