import { useEffect, useState } from 'react';
import { Icons } from '../components/common/Icons';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import Pagination from '../components/common/Pagination';
import LeaveTable from '../components/leaves/LeaveTable';
import LeaveRequestModal from '../components/leaves/LeaveRequestModal';
import LeaveDecisionModal from '../components/leaves/LeaveDecisionModal';
import { useLeaves } from '../hooks/useLeaves';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../utils/permissions';
import { LEAVE_STATUS_OPTIONS } from '../utils/constants';
import { fetchEmployees } from '../services/employeeService';

const EMPTY_FORM = {
  employee_id: '',
  leave_type: 'annual',
  start_date: '',
  end_date: '',
  reason: '',
};

// The API returns { field: ['message', ...] }; the form shows one per field.
function firstMessages(errors) {
  return Object.fromEntries(Object.entries(errors).map(([field, msgs]) => [field, msgs[0]]));
}

function Leaves() {
  const { can } = useAuth();
  const canCreate = can(PERMISSIONS.CREATE_LEAVE);
  const canDecide = can(PERMISSIONS.DECIDE_LEAVE);

  const {
    requests,
    meta,
    status,
    changeStatus,
    page,
    setPage,
    loading,
    error,
    load,
    actingId,
    submitRequest,
    approve,
    reject,
    cancel,
    toast,
  } = useLeaves();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [decision, setDecision] = useState(null); // { request, mode }

  // Only roles that can file requests need the employee list.
  useEffect(() => {
    if (!canCreate) return;
    fetchEmployees()
      .then((all) => setEmployees(all.filter((e) => e.status !== 'terminated')))
      .catch(() => setEmployees([]));
  }, [canCreate]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientErrors = {};
    if (!formData.employee_id) clientErrors.employee_id = 'Please select an employee';
    if (!formData.start_date) clientErrors.start_date = 'Start date is required';
    if (!formData.end_date) clientErrors.end_date = 'End date is required';
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      clientErrors.end_date = 'End date cannot be before the start date';
    }
    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    const result = await submitRequest(formData);
    setSubmitting(false);

    if (result.ok) {
      closeForm();
    } else {
      setFormErrors(firstMessages(result.errors));
    }
  };

  const handleDecisionSubmit = async (note) => {
    const { request, mode } = decision;
    const result = mode === 'approve' ? await approve(request.id, note) : await reject(request.id, note);
    // On failure the toast explains why; a stale request is refreshed by the hook.
    if (result.ok || Object.keys(result.errors).length === 0) setDecision(null);
  };

  const handleCancel = (request) => {
    if (!window.confirm(`Cancel ${request.employee.name}'s leave request?`)) return;
    cancel(request.id);
  };

  return (
    <>
      <div className="content-section animate-fade-in-up">
        <div className="content-section-header">
          <div>
            <div className="content-section-title">Leave Requests</div>
            <div className="content-section-subtitle">
              {canDecide
                ? 'Review and decide on employee leave requests'
                : 'File and track employee leave requests'}
            </div>
          </div>
          {canCreate && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Icons.Plus /> New Request
            </Button>
          )}
        </div>

        <div className="filter-tabs" role="tablist" aria-label="Filter by status">
          {LEAVE_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value || 'all'}
              type="button"
              role="tab"
              aria-selected={status === opt.value}
              className={`filter-tab ${status === opt.value ? 'active' : ''}`}
              onClick={() => changeStatus(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <LeaveTable
          requests={requests}
          loading={loading}
          error={error}
          actingId={actingId}
          canCreate={canCreate}
          canDecide={canDecide}
          onRetry={load}
          onApprove={(request) => setDecision({ request, mode: 'approve' })}
          onReject={(request) => setDecision({ request, mode: 'reject' })}
          onCancel={handleCancel}
        />

        {!loading && !error && (
          <Pagination
            currentPage={page}
            totalPages={meta.last_page}
            totalItems={meta.total}
            pageSize={meta.per_page}
            onPageChange={setPage}
            itemLabel="requests"
          />
        )}
      </div>

      <LeaveRequestModal
        isOpen={isFormOpen}
        employees={employees}
        formData={formData}
        errors={formErrors}
        submitting={submitting}
        onChange={handleFormChange}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      {decision && (
        <LeaveDecisionModal
          key={`${decision.request.id}-${decision.mode}`}
          request={decision.request}
          mode={decision.mode}
          submitting={actingId === decision.request.id}
          onClose={() => setDecision(null)}
          onSubmit={handleDecisionSubmit}
        />
      )}

      <Toast toast={toast} />
    </>
  );
}

export default Leaves;
