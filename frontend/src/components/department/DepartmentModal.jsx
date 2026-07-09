import { Icons } from '../common/Icons';
import Button from '../common/Button';
import DepartmentFormFields from './DepartmentForm';

function DepartmentModal({
  isOpen,
  isEditing,
  onClose,
  formData,
  errors,
  onChange,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isEditing ? 'Edit Department' : 'Add New Department'}</span>
          <button className="modal-close" onClick={onClose} type="button">
            <Icons.X />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <DepartmentFormFields formData={formData} errors={errors} onChange={onChange} />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Department'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DepartmentModal;
