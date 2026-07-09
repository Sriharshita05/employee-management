import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
} from '../services/departmentService';

const INITIAL_FORM = { name: '', description: '' };

function validateForm(formData) {
  const errors = {};
  if (!formData.name.trim()) {
    errors.name = 'Department name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  return errors;
}

function mapServerErrors(err) {
  if (err.response?.data?.errors) {
    const serverErrors = {};
    Object.keys(err.response.data.errors).forEach((key) => {
      serverErrors[key] = err.response.data.errors[key][0];
    });
    return serverErrors;
  }
  return null;
}

export function useDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setError(err.message || 'Failed to fetch department data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return departments;
    return departments.filter(
      (d) =>
        d.name?.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query)
    );
  }, [departments, searchQuery]);

  const stats = useMemo(() => {
    const totalDepartments = departments.length;
    const totalEmployees = departments.reduce((sum, d) => sum + (d.employee_count || 0), 0);
    const totalSalary = departments.reduce((sum, d) => sum + Number(d.total_salary || 0), 0);
    const avgSize = totalDepartments > 0 ? Math.round(totalEmployees / totalDepartments) : 0;
    return { totalDepartments, totalEmployees, totalSalary, avgSize };
  }, [departments]);

  const openAddModal = useCallback(() => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((department) => {
    setEditingId(department.id);
    setFormData({ name: department.name || '', description: department.description || '' });
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (submitting) return;
    setIsModalOpen(false);
    setFormErrors({});
  }, [submitting]);

  const handleFormInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateForm(formData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setSubmitting(true);
      try {
        if (editingId) {
          const updated = await updateDepartment(editingId, formData);
          setDepartments((prev) =>
            prev.map((d) => (d.id === editingId ? { ...d, ...updated } : d))
          );
          showToast('Department updated successfully!');
        } else {
          const created = await createDepartment(formData);
          setDepartments((prev) => [...prev, { ...created, employee_count: 0, total_salary: 0 }]);
          showToast('Department added successfully!');
        }
        setIsModalOpen(false);
        setFormData(INITIAL_FORM);
        setFormErrors({});
      } catch (err) {
        console.error('Error saving department:', err);
        const serverErrors = mapServerErrors(err);
        if (serverErrors) {
          setFormErrors(serverErrors);
        } else {
          showToast(err.response?.data?.message || 'Failed to save department.', 'error');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [formData, editingId, showToast]
  );

  const handleDeleteClick = useCallback((department) => {
    setDeleteError(null);
    setDepartmentToDelete(department);
  }, []);

  const handleCancelDelete = useCallback(() => {
    if (deleting) return;
    setDepartmentToDelete(null);
    setDeleteError(null);
  }, [deleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!departmentToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteDepartment(departmentToDelete.id);
      setDepartments((prev) => prev.filter((d) => d.id !== departmentToDelete.id));
      setDepartmentToDelete(null);
      showToast('Department deleted successfully!');
    } catch (err) {
      console.error('Error deleting department:', err);
      setDeleteError(
        err.response?.data?.message || 'Failed to delete department. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  }, [departmentToDelete, showToast]);

  return {
    departments,
    filteredDepartments,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    loadDepartments,
    stats,
    isModalOpen,
    editingId,
    formData,
    formErrors,
    submitting,
    openAddModal,
    openEditModal,
    closeModal,
    handleFormInputChange,
    handleSubmit,
    departmentToDelete,
    deleting,
    deleteError,
    handleDeleteClick,
    handleCancelDelete,
    handleConfirmDelete,
    toast,
  };
}
