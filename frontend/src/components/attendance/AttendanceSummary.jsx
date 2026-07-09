function AttendanceSummary({ summary }) {
  if (!summary) return null;

  const items = [
    { label: 'Present', value: summary.present, className: 'present' },
    { label: 'Late', value: summary.late, className: 'late' },
    { label: 'Absent', value: summary.absent, className: 'absent' },
    { label: 'On Leave', value: summary.on_leave, className: 'on-leave' },
    { label: 'Not Marked', value: summary.not_marked, className: 'not-marked' },
  ];

  return (
    <div className="attendance-summary-grid animate-fade-in-up">
      {items.map((item) => (
        <div key={item.label} className={`attendance-summary-card ${item.className}`}>
          <div className="attendance-summary-value">{item.value}</div>
          <div className="attendance-summary-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export default AttendanceSummary;
