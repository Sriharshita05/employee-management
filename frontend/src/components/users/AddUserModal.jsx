import { Icons } from '../common/Icons';
import Button from '../common/Button';
import Input from '../common/Input';
import { ROLE_LABELS, ROLES } from '../../utils/permissions';

const ROLE_OPTIONS = Object.values(ROLES).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

function AddUserModal({ isOpen, formData, errors, submitting, onChange, onClose, onSubmit }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add New User</span>
          <button className="modal-close" onClick={onClose} type="button">
            <Icons.X />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) => onChange('name', e.target.value)}
                error={errors.name?.[0]}
                fullWidth
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                error={errors.email?.[0]}
                fullWidth
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => onChange('password', e.target.value)}
                error={errors.password?.[0]}
                fullWidth
              />
              <Input
                label="Role"
                name="role"
                as="select"
                options={ROLE_OPTIONS}
                value={formData.role}
                onChange={(e) => onChange('role', e.target.value)}
                fullWidth
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;
