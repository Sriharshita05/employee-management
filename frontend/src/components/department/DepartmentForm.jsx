import Input from '../common/Input';

function DepartmentFormFields({ formData, errors, onChange, idPrefix = '' }) {
  return (
    <>
      <Input
        fullWidth
        label="Department Name"
        id={`${idPrefix}name`}
        name="name"
        placeholder="e.g. Customer Support"
        value={formData.name}
        onChange={onChange}
        error={errors.name}
      />

      <Input
        fullWidth
        as="textarea"
        label="Description (optional)"
        id={`${idPrefix}description`}
        name="description"
        placeholder="What does this department do?"
        value={formData.description}
        onChange={onChange}
        error={errors.description}
        rows={3}
      />
    </>
  );
}

export default DepartmentFormFields;
