import { Icons } from '../components/common/Icons';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import BarChart from '../components/reports/BarChart';
import AttendanceTrendChart from '../components/reports/AttendanceTrendChart';
import { useReports } from '../hooks/useReports';
import { formatSalary } from '../utils/constants';
import { downloadCSV } from '../utils/csv';

function Reports() {
  const { report, loading, error, loadReport } = useReports();

  const handleExport = () => {
    if (!report) return;
    downloadCSV(
      `department-report-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Department', 'Employees', 'Total Salary'],
      report.departments.map((d) => [d.name, d.employee_count, d.total_salary])
    );
  };

  if (loading) {
    return (
      <div className="content-section animate-fade-in-up">
        <div style={{ padding: '60px 0' }}>
          <Loader text="Crunching workforce numbers…" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="content-section animate-fade-in-up">
        <EmptyState
          icon={<Icons.AlertTriangle />}
          message={error || 'Failed to load reports.'}
          actionLabel="Retry"
          onAction={loadReport}
        />
      </div>
    );
  }

  const statusRows = [
    { label: 'Active', value: report.active_employees },
    { label: 'Inactive', value: report.inactive_employees },
    { label: 'Terminated', value: report.terminated_employees },
  ];

  const deptEmployeeRows = report.departments.map((d) => ({
    label: d.name,
    value: d.employee_count,
  }));

  const deptSalaryRows = report.departments.map((d) => ({
    label: d.name,
    value: d.total_salary,
  }));

  return (
    <>
      <div className="stat-grid animate-fade-in-up">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrap indigo">
              <Icons.Users />
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{report.total_employees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrap emerald">
              <Icons.UserCheck />
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{report.active_employees}</div>
            <div className="stat-label">Active Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrap amber">
              <Icons.DollarSign />
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{formatSalary(report.total_salary)}</div>
            <div className="stat-label">Total Salary Spend</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrap pink">
              <Icons.Briefcase />
            </div>
          </div>
          <div className="stat-body">
            <div className="stat-value">{formatSalary(report.avg_salary)}</div>
            <div className="stat-label">Average Salary</div>
          </div>
        </div>
      </div>

      <div className="content-section animate-fade-in-up delay-5">
        <div className="content-section-header">
          <div>
            <div className="content-section-title">Reports</div>
            <div className="content-section-subtitle">
              View analytics and generate workforce reports
            </div>
          </div>
          <div className="content-section-actions">
            <Button variant="outline" onClick={handleExport}>
              <Icons.Download /> Export CSV
            </Button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <div className="report-grid">
            <div>
              <div className="content-section-title" style={{ marginBottom: '16px' }}>
                Employees by Department
              </div>
              {deptEmployeeRows.length > 0 ? (
                <BarChart rows={deptEmployeeRows} />
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No department data yet.</p>
              )}
            </div>

            <div>
              <div className="content-section-title" style={{ marginBottom: '16px' }}>
                Salary Spend by Department
              </div>
              {deptSalaryRows.length > 0 ? (
                <BarChart rows={deptSalaryRows} formatValue={formatSalary} />
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No department data yet.</p>
              )}
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <div className="content-section-title" style={{ marginBottom: '16px' }}>
              Employee Status Breakdown
            </div>
            <BarChart rows={statusRows} />
          </div>

          <div style={{ marginTop: '32px' }}>
            <div className="content-section-title" style={{ marginBottom: '16px' }}>
              Attendance Trend (Last 7 Days)
            </div>
            <AttendanceTrendChart trend={report.attendance_trend} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Reports;
