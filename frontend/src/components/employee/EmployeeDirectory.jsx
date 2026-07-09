import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../common/Icons';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import ExportMenu from '../common/ExportMenu';
import EmployeeTable from './EmployeeTable';
import { useEmployees } from '../../hooks/useEmployees';
import { useSortedList } from '../../hooks/useSort';
import { useAuth } from '../../context/AuthContext';
import { PERMISSIONS } from '../../utils/permissions';
import { DEPT_MAP, formatSalary } from '../../utils/constants';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportFile';

const PAGE_SIZE = 10;

const EMPLOYEE_SORT_COMPARATORS = {
  name: (emp) => emp.name?.toLowerCase() ?? '',
  department: (emp) => (DEPT_MAP[emp.department_id] || '').toLowerCase(),
  salary: (emp) => Number(emp.salary) || 0,
  status: (emp) => emp.status?.toLowerCase() ?? '',
};

function EmployeeDirectory() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const {
    filteredEmployees,
    loading,
    error,
    loadEmployees,
    setIsAddModalOpen,
    handleDeleteClick,
    showToast,
  } = useEmployees();

  const [currentPage, setCurrentPage] = useState(1);

  const { sorted: sortedEmployees, sortState, toggleSort } = useSortedList(
    filteredEmployees,
    EMPLOYEE_SORT_COMPARATORS
  );

  const totalItems = sortedEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // Keep the current page in range whenever the underlying (filtered/sorted) list
  // changes, e.g. after a search, sort, delete, or add.
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  // Sorting re-orders the whole result set, so jump back to page 1 for context.
  const handleSort = (key) => {
    toggleSort(key);
    setCurrentPage(1);
  };

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedEmployees.slice(start, start + PAGE_SIZE);
  }, [sortedEmployees, currentPage]);

  const handleEdit = (id) => {
    navigate(`/employees/${id}/edit`);
  };

  const exportHeaders = ['Name', 'Email', 'Phone', 'Department', 'Salary', 'Status'];
  const buildExportRows = () =>
    sortedEmployees.map((emp) => [
      emp.name,
      emp.email,
      emp.phone,
      DEPT_MAP[emp.department_id] || `Dept #${emp.department_id}`,
      Number(emp.salary) || 0,
      emp.status,
    ]);

  const handleExportCSV = () => {
    if (sortedEmployees.length === 0) {
      showToast('No employees to export.', 'error');
      return;
    }
    exportToCSV('employee-directory', exportHeaders, buildExportRows());
    showToast('Employee directory exported as CSV!');
  };

  const handleExportExcel = () => {
    if (sortedEmployees.length === 0) {
      showToast('No employees to export.', 'error');
      return;
    }
    exportToExcel('employee-directory', 'Employees', exportHeaders, buildExportRows());
    showToast('Employee directory exported as Excel!');
  };

  const handleExportPDF = () => {
    if (sortedEmployees.length === 0) {
      showToast('No employees to export.', 'error');
      return;
    }
    exportToPDF('employee-directory', {
      title: 'Employee Directory',
      subtitle: `Generated ${new Date().toLocaleDateString()} \u00b7 ${sortedEmployees.length} employee(s)`,
      columns: [
        { label: 'Name', width: 130 },
        { label: 'Email', width: 160 },
        { label: 'Phone', width: 90 },
        { label: 'Department', width: 110 },
        { label: 'Salary', width: 90 },
        { label: 'Status', width: 80 },
      ],
      rows: sortedEmployees.map((emp) => [
        emp.name,
        emp.email,
        emp.phone,
        DEPT_MAP[emp.department_id] || `Dept #${emp.department_id}`,
        formatSalary(emp.salary),
        emp.status,
      ]),
    });
    showToast('Employee directory exported as PDF!');
  };

  return (
    <div className="content-section animate-fade-in-up delay-5">
      <div className="content-section-header">
        <div>
          <div className="content-section-title">Employee Directory</div>
          <div className="content-section-subtitle">
            Manage and monitor all team members
          </div>
        </div>
        <div className="content-section-actions">
          <ExportMenu
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            disabled={loading || !!error}
          />
          {can(PERMISSIONS.ADD_EMPLOYEE) && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Icons.Plus /> Add Employee
            </Button>
          )}
        </div>
      </div>
      <EmployeeTable
        employees={paginatedEmployees}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onRetry={loadEmployees}
        sortState={sortState}
        onSort={handleSort}
        canEdit={can(PERMISSIONS.EDIT_EMPLOYEE)}
        canDelete={can(PERMISSIONS.DELETE_EMPLOYEE)}
      />
      {!loading && !error && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

export default EmployeeDirectory;
