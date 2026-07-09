import { Icons } from '../common/Icons';
import { formatSalary } from '../../utils/constants';
import StatsCard from './StatsCard';

function DashboardCards({ stats }) {
  const { totalEmployees, activeCount, avgSalary, departmentCount } = stats;

  return (
    <div className="stat-grid">
      <StatsCard
        icon={<Icons.Users />}
        value={totalEmployees}
        label="Total Employees"
        trend="+12%"
        trendDir="up"
        colorClass="indigo"
        delay={1}
      />
      <StatsCard
        icon={<Icons.UserCheck />}
        value={activeCount}
        label="Active Employees"
        trend="+8%"
        trendDir="up"
        colorClass="emerald"
        delay={2}
      />
      <StatsCard
        icon={<Icons.DollarSign />}
        value={formatSalary(avgSalary)}
        label="Average Salary"
        trend="+5%"
        trendDir="up"
        colorClass="amber"
        delay={3}
      />
      <StatsCard
        icon={<Icons.Briefcase />}
        value={departmentCount}
        label="Departments"
        trend="-2%"
        trendDir="down"
        colorClass="pink"
        delay={4}
      />
    </div>
  );
}

export default DashboardCards;
