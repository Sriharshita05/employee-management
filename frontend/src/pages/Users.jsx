import { useCallback, useEffect, useState } from 'react';
import { Icons } from '../components/common/Icons';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import UserTable from '../components/users/UserTable';
import AddUserModal from '../components/users/AddUserModal';
import { ROLES } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/userService';

const EMPTY_FORM = { name: '', email: '', password: '', role: ROLES.MANAGER };

function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchUsers()
      .then(setUsers)
      .catch(() => setError('Failed to load user accounts.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (id, role) => {
    const previous = users;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    try {
      await updateUser(id, { role });
      showToast('Role updated successfully!');
    } catch {
      setUsers(previous);
      showToast('Failed to update role.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this user account? This cannot be undone.')) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('User removed.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove user.', 'error');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    try {
      const newUser = await createUser(formData);
      setUsers((prev) => [...prev, newUser]);
      setIsAddOpen(false);
      setFormData(EMPTY_FORM);
      showToast('User account created!');
    } catch (err) {
      setFormErrors(err.response?.data?.errors || {});
      showToast('Failed to create user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content-section animate-fade-in-up">
      <div className="content-section-header">
        <div>
          <div className="content-section-title">Manage Users</div>
          <div className="content-section-subtitle">
            Create dashboard accounts and control their access level
          </div>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Icons.Plus /> Add User
        </Button>
      </div>

      <UserTable
        users={users}
        loading={loading}
        error={error}
        onRetry={loadUsers}
        currentUserId={currentUser?.id}
        onRoleChange={handleRoleChange}
        onDelete={handleDelete}
      />

      <AddUserModal
        isOpen={isAddOpen}
        formData={formData}
        errors={formErrors}
        submitting={submitting}
        onChange={handleFormChange}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <Toast toast={toast} />
    </div>
  );
}

export default Users;
