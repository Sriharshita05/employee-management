import { getGreeting } from '../utils/constants';
import DashboardCards from '../components/dashboard/DashboardCards';
import EmployeeDirectory from '../components/employee/EmployeeDirectory';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { stats } = useEmployees();
  const { user } = useAuth();

  return (
    <>
      <div className="animate-fade-in-up">
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            fontWeight: 600,
            color: 'var(--color-text)',
            letterSpacing: '-0.3px',
            margin: '0 0 4px',
          }}
        >
          Good {getGreeting()}, {user?.name || 'there'} 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
          Here&apos;s what&apos;s happening with your team today.
        </p>
      </div>

      <DashboardCards stats={stats} />

      <EmployeeDirectory />
    </>
  );
}

export default Dashboard;
