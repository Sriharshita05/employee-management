function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  ...props
}) {
  const variantClass =
    variant === 'outline'
      ? 'btn btn-outline'
      : variant === 'danger'
        ? 'btn btn-danger'
        : 'btn btn-primary';

  return (
    <button
      type={type}
      className={`${variantClass} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
