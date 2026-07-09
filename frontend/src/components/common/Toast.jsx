function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
        <span className={toast.type === 'error' ? 'toast-error-icon' : 'toast-success-icon'}>
          {toast.type === 'error' ? '✕' : '✓'}
        </span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

export default Toast;
