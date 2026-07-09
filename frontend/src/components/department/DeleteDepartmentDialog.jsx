import { Icons } from '../common/Icons';
import Button from '../common/Button';

function DeleteDepartmentDialog({ department, deleting, error, onCancel, onConfirm }) {
  if (!department) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container modal-container-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Delete Department</span>
          <button className="modal-close" onClick={onCancel} disabled={deleting} type="button">
            <Icons.X />
          </button>
        </div>
        <div className="modal-body">
          <div className="delete-confirm-icon">
            <Icons.AlertCircle />
          </div>
          <p className="delete-confirm-text">
            Are you sure you want to delete <strong>{department.name}</strong>? This action
            cannot be undone.
          </p>
          {error && (
            <p className="delete-confirm-text" style={{ color: '#f87171', marginTop: '8px' }}>
              {error}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Department'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteDepartmentDialog;
