import { Icons } from '../components/common/Icons';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import DepartmentGrid from '../components/department/DepartmentGrid';
import DepartmentModal from '../components/department/DepartmentModal';
import DeleteDepartmentDialog from '../components/department/DeleteDepartmentDialog';
import { useDepartments } from '../hooks/useDepartments';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../utils/permissions';
import { formatSalary } from '../utils/constants';

export default function Departments() {
  const { can } = useAuth();
  const canManage = can(PERMISSIONS.MANAGE_DEPARTMENTS);
  const {
    filteredDepartments,
    loading,
    error,
    loadDepartments,
    searchQuery,
    setSearchQuery,
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
  } = useDepartments();

  return (
    <>
      <div className="stat-grid animate-fade-in-up">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrap indigo">
              <Icons.Building />
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.totalDepartments}</div>
            <div className="stat-label">Total Departments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrap emerald">
              <Icons.Users />
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.totalEmployees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrap amber">
              <Icons.DollarSign />
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{formatSalary(stats.totalSalary)}</div>
            <div className="stat-label">Total Salary Spend</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrap pink">
              <Icons.Briefcase />
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{stats.avgSize}</div>
            <div className="stat-label">Avg. Team Size</div>
          </div>
        </div>
      </div>

      <div className="content-section animate-fade-in-up delay-5">
        <div className="content-section-header">
          <div>
            <div className="content-section-title">Departments</div>
            <div className="content-section-subtitle">
              Manage organizational departments and teams
            </div>
          </div>
          <div className="content-section-actions">
            <input
              type="text"
              className="form-input"
              style={{ width: '220px' }}
              placeholder="Search departments…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {canManage && (
              <Button onClick={openAddModal}>
                <Icons.Plus /> Add Department
              </Button>
            )}
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          <DepartmentGrid
            departments={filteredDepartments}
            loading={loading}
            error={error}
            onEdit={canManage ? openEditModal : null}
            onDelete={canManage ? handleDeleteClick : null}
            onRetry={loadDepartments}
          />
        </div>
      </div>

      <DepartmentModal
        isOpen={canManage && isModalOpen}
        isEditing={Boolean(editingId)}
        onClose={closeModal}
        formData={formData}
        errors={formErrors}
        onChange={handleFormInputChange}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      <DeleteDepartmentDialog
        department={canManage ? departmentToDelete : null}
        deleting={deleting}
        error={deleteError}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <Toast toast={toast} />
    </>
  );
}
