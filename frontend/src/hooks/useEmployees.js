import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createEmployee,
  deleteEmployee,
  fetchEmployee,
  fetchEmployees,
  updateEmployee,
} from '../services/employeeService';
import { DEPT_MAP, INITIAL_EMPLOYEE_FORM } from '../utils/constants';

export const EmployeeContext = createContext(null);

function validateEmployeeForm(formData) {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = 'Full Name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email Address is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email format is invalid';
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (formData.phone.trim().length < 5) {
    errors.phone = 'Phone number must be at least 5 digits';
  }

  if (!formData.department_id) {
    errors.department_id = 'Please select a department';
  }

  if (!formData.salary) {
    errors.salary = 'Salary is required';
  } else if (isNaN(formData.salary) || Number(formData.salary) <= 0) {
    errors.salary = 'Salary must be a positive number';
  }

  if (!formData.status) {
    errors.status = 'Status is required';
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

export function useEmployeeState() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_EMPLOYEE_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [editFormData, setEditFormData] = useState(INITIAL_EMPLOYEE_FORM);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [fetchingEmployee, setFetchingEmployee] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);

  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Axios fetch error:', err);
      setError(err.message || 'Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((emp) => {
      const departmentName = (DEPT_MAP[emp.department_id] || '').toLowerCase();
      return (
        emp.name?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        String(emp.id).toLowerCase().includes(query) ||
        departmentName.includes(query)
      );
    });
  }, [employees, searchQuery]);

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeCount = employees.filter((e) => e.status === 'active').length;
    const avgSalary =
      totalEmployees > 0
        ? Math.round(
            employees.reduce((sum, e) => sum + Number(e.salary), 0) / totalEmployees
          )
        : 0;
    const departmentCount = [...new Set(employees.map((e) => e.department_id))].length;

    return { totalEmployees, activeCount, avgSalary, departmentCount };
  }, [employees]);

  const loadEmployeeForEdit = useCallback(
    async (id) => {
      setFetchingEmployee(true);
      setEditFormErrors({});
      try {
        const emp = await fetchEmployee(id);
        setEditFormData({
          name: emp.name || '',
          email: emp.email || '',
          phone: emp.phone || '',
          department_id: emp.department_id || '',
          salary: emp.salary || '',
          status: emp.status || 'active',
        });
      } catch (err) {
        console.error('Error fetching employee details:', err);
        showToast('Failed to load employee data.', 'error');
        throw err;
      } finally {
        setFetchingEmployee(false);
      }
    },
    [showToast]
  );

  const handleFormInputChange = useCallback((e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditFormData((prev) => ({ ...prev, [name]: value }));
      setEditFormErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setFormErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
    }
  }, []);

  const handleAddSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validateEmployeeForm(formData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setSubmitting(true);
      try {
        const created = await createEmployee(formData);
        setEmployees((prev) => [created, ...prev]);
        setIsAddModalOpen(false);
        setFormData(INITIAL_EMPLOYEE_FORM);
        setFormErrors({});
        showToast('Employee added successfully!');
      } catch (err) {
        console.error('Error submitting employee data:', err);
        const serverErrors = mapServerErrors(err);
        if (serverErrors) {
          setFormErrors(serverErrors);
        } else {
          alert(err.response?.data?.message || 'Failed to submit data to the server.');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [formData, showToast]
  );

  const handleEditSubmit = useCallback(
    async (e, employeeId) => {
      e.preventDefault();
      const errors = validateEmployeeForm(editFormData);
      if (Object.keys(errors).length > 0) {
        setEditFormErrors(errors);
        return false;
      }

      setSavingEmployee(true);
      try {
        const updated = await updateEmployee(employeeId, editFormData);
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === Number(employeeId) ? updated : emp))
        );
        showToast('Employee updated successfully!');
        return true;
      } catch (err) {
        console.error('Error updating employee data:', err);
        const serverErrors = mapServerErrors(err);
        if (serverErrors) {
          setEditFormErrors(serverErrors);
        } else {
          alert(err.response?.data?.message || 'Failed to update employee data.');
        }
        return false;
      } finally {
        setSavingEmployee(false);
      }
    },
    [editFormData, showToast]
  );

  const handleDeleteClick = useCallback((employee) => {
    setEmployeeToDelete(employee);
  }, []);

  const handleCancelDelete = useCallback(() => {
    if (deleting) return;
    setEmployeeToDelete(null);
  }, [deleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!employeeToDelete) return;

    setDeleting(true);
    try {
      await deleteEmployee(employeeToDelete.id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeToDelete.id));
      setEmployeeToDelete(null);
      showToast('Employee deleted successfully!');
    } catch (err) {
      console.error('Error deleting employee:', err);
      showToast(
        err.response?.data?.message || 'Failed to delete employee. Please try again.',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  }, [employeeToDelete, showToast]);

  const resetAddForm = useCallback(() => {
    setFormData(INITIAL_EMPLOYEE_FORM);
    setFormErrors({});
  }, []);

  return {
    employees,
    filteredEmployees,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    loadEmployees,
    stats,
    isAddModalOpen,
    setIsAddModalOpen,
    formData,
    formErrors,
    submitting,
    handleFormInputChange,
    handleAddSubmit,
    resetAddForm,
    editFormData,
    editFormErrors,
    fetchingEmployee,
    savingEmployee,
    loadEmployeeForEdit,
    handleEditSubmit,
    employeeToDelete,
    deleting,
    handleDeleteClick,
    handleCancelDelete,
    handleConfirmDelete,
    toast,
    showToast,
  };
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
}
