import { Icons } from '../common/Icons';

function StatsCard({ icon, value, label, trend, trendDir, colorClass, delay }) {
  return (
    <div className={`stat-card animate-fade-in-up delay-${delay}`}>
      <div className="stat-header">
        <div className={`stat-icon-wrap ${colorClass}`}>{icon}</div>
        <div className={`stat-trend ${trendDir}`}>
          {trendDir === 'up' ? <Icons.TrendUp /> : <Icons.TrendDown />}
          {trend}
        </div>
      </div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default StatsCard;
