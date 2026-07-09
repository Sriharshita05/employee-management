import Input from '../common/Input';
import Button from '../common/Button';
import { DEPARTMENT_OPTIONS, STATUS_OPTIONS } from '../../utils/constants';

function EmployeeFormFields({ formData, errors, onChange, idPrefix = '' }) {
  const departmentOptions = [
    { value: '', label: 'Select Department' },
    ...DEPARTMENT_OPTIONS,
  ];

  return (
    <>
      <Input
        fullWidth
        label="Full Name"
        id={`${idPrefix}name`}
        name="name"
        placeholder="e.g. John Doe"
        value={formData.name}
        onChange={onChange}
        error={errors.name}
      />

      <Input
        label="Email Address"
        id={`${idPrefix}email`}
        name="email"
        type="email"
        placeholder="e.g. john.doe@example.com"
        value={formData.email}
        onChange={onChange}
        error={errors.email}
      />

      <Input
        label="Phone Number"
        id={`${idPrefix}phone`}
        name="phone"
        placeholder="e.g. 555-0199"
        value={formData.phone}
        onChange={onChange}
        error={errors.phone}
      />

      <Input
        as="select"
        label="Department"
        id={`${idPrefix}department_id`}
        name="department_id"
        value={formData.department_id}
        onChange={onChange}
        options={departmentOptions}
        error={errors.department_id}
      />

      <Input
        as="select"
        label="Status"
        id={`${idPrefix}status`}
        name="status"
        value={formData.status}
        onChange={onChange}
        options={STATUS_OPTIONS}
        error={errors.status}
      />

      <Input
        fullWidth
        label="Annual Salary ($)"
        id={`${idPrefix}salary`}
        name="salary"
        type="number"
        min="0"
        step="any"
        placeholder="e.g. 75000"
        value={formData.salary}
        onChange={onChange}
        error={errors.salary}
      />
    </>
  );
}

function EmployeeForm({
  formData,
  errors,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = 'Save Changes',
  submitting = false,
  idPrefix = '',
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <EmployeeFormFields
          formData={formData}
          errors={errors}
          onChange={onChange}
          idPrefix={idPrefix}
        />
        {onCancel && (
          <div
            className="full-width"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            <Button variant="outline" type="button" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? `${submitLabel}...` : submitLabel}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}

export { EmployeeFormFields };
export default EmployeeForm;
