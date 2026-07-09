function Loader({ text = 'Loading…', className = '' }) {
  return (
    <div className={`loading-container ${className}`.trim()}>
      <div className="loading-spinner" />
      <span className="loading-text">{text}</span>
    </div>
  );
}

export default Loader;
