import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmployeeForm from '../components/employee/EmployeeForm';
import EmployeeDirectory from '../components/employee/EmployeeDirectory';
import { useEmployees } from '../hooks/useEmployees';

function EmployeeEditView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    editFormData,
    editFormErrors,
    fetchingEmployee,
    savingEmployee,
    loadEmployeeForEdit,
    handleFormInputChange,
    handleEditSubmit,
  } = useEmployees();

  useEffect(() => {
    loadEmployeeForEdit(id).catch(() => {
      navigate('/employees');
    });
  }, [id, loadEmployeeForEdit, navigate]);

  const handleSubmit = async (e) => {
    const success = await handleEditSubmit(e, id);
    if (success) {
      navigate('/employees');
    }
  };

  return (
    <div className="content-section animate-fade-in-up">
      <div className="content-section-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="content-section-title">Edit Employee</div>
          <div className="content-section-subtitle">
            Update profile and company settings for this employee
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/employees')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Back to Directory
        </Button>
      </div>

      {fetchingEmployee ? (
        <div style={{ padding: '60px 0' }}>
          <Loader text="Fetching employee profile..." />
        </div>
      ) : (
        <div style={{ maxWidth: '640px', padding: '0 24px 24px' }}>
          <EmployeeForm
            formData={editFormData}
            errors={editFormErrors}
            onChange={(e) => handleFormInputChange(e, true)}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard')}
            submitLabel="Save Changes"
            submitting={savingEmployee}
            idPrefix="edit-"
          />
        </div>
      )}
    </div>
  );
}

function EmployeesListView() {
  return <EmployeeDirectory />;
}

function Employees() {
  const { id } = useParams();

  if (id) {
    return <EmployeeEditView />;
  }

  return <EmployeesListView />;
}

export default Employees;
