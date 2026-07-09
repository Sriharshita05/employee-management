function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  className = '',
  as = 'input',
  options = [],
  fullWidth = false,
  ...props
}) {
  const inputClass = `form-input ${className}`.trim();

  return (
    <div className={`form-group ${fullWidth ? 'full-width' : ''}`.trim()}>
      {label && (
        <label className="form-label" htmlFor={id || name}>
          {label}
        </label>
      )}
      {as === 'select' ? (
        <select
          id={id || name}
          name={name}
          className={inputClass}
          value={value}
          onChange={onChange}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={id || name}
          name={name}
          className={inputClass}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
      ) : (
        <input
          id={id || name}
          name={name}
          type={type}
          className={inputClass}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
      )}
      {error && <span className="form-error-text">{error}</span>}
    </div>
  );
}

export default Input;
