function BarChart({ rows, formatValue = (v) => v }) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className="bar-chart">
      {rows.map((row) => (
        <div className="bar-chart-row" key={row.label}>
          <div className="bar-chart-label" title={row.label}>
            {row.label}
          </div>
          <div className="bar-chart-track">
            <div
              className="bar-chart-fill"
              style={{ width: `${Math.max(3, (row.value / max) * 100)}%` }}
            />
          </div>
          <div className="bar-chart-value">{formatValue(row.value)}</div>
        </div>
      ))}
    </div>
  );
}

export default BarChart;
