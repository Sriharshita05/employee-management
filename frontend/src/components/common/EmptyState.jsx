import Button from './Button';

function EmptyState({ icon, message, actionLabel, onAction }) {
  return (
    <div className="error-container">
      {icon && <div className="error-icon">{icon}</div>}
      <span className="error-text">{message}</span>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
