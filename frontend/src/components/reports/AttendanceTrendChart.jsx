import { formatDateShort } from '../../utils/constants';

function AttendanceTrendChart({ trend }) {
  if (!trend || trend.length === 0) return null;

  const max = Math.max(
    1,
    ...trend.map((d) => d.present + d.late + d.absent + d.on_leave)
  );

  return (
    <>
      <div className="trend-chart">
        {trend.map((day) => {
          const total = day.present + day.late + day.absent + day.on_leave;
          const heightPct = Math.max(2, (total / max) * 100);

          return (
            <div className="trend-bar-col" key={day.date}>
              <div className="trend-bar-stack" style={{ height: `${heightPct}%` }}>
                {day.present > 0 && (
                  <div
                    className="trend-bar-segment present"
                    style={{ height: `${(day.present / total) * 100}%` }}
                  />
                )}
                {day.late > 0 && (
                  <div
                    className="trend-bar-segment late"
                    style={{ height: `${(day.late / total) * 100}%` }}
                  />
                )}
                {day.absent > 0 && (
                  <div
                    className="trend-bar-segment absent"
                    style={{ height: `${(day.absent / total) * 100}%` }}
                  />
                )}
                {day.on_leave > 0 && (
                  <div
                    className="trend-bar-segment on_leave"
                    style={{ height: `${(day.on_leave / total) * 100}%` }}
                  />
                )}
              </div>
              <div className="trend-bar-date">{formatDateShort(day.date)}</div>
            </div>
          );
        })}
      </div>
      <div className="report-legend">
        <span className="legend-item">
          <span className="legend-dot present" /> Present
        </span>
        <span className="legend-item">
          <span className="legend-dot late" /> Late
        </span>
        <span className="legend-item">
          <span className="legend-dot absent" /> Absent
        </span>
        <span className="legend-item">
          <span className="legend-dot on_leave" /> On Leave
        </span>
      </div>
    </>
  );
}

export default AttendanceTrendChart;
