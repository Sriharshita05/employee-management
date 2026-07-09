import { Icons } from '../components/common/Icons';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import AttendanceSummary from '../components/attendance/AttendanceSummary';
import AttendanceTable from '../components/attendance/AttendanceTable';
import { useAttendance } from '../hooks/useAttendance';
import { useSortedList } from '../hooks/useSort';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../utils/permissions';
import { formatDateReadable, todayISO } from '../utils/constants';

const ATTENDANCE_SORT_COMPARATORS = {
  name: (r) => r.employee_name?.toLowerCase() ?? '',
  department: (r) => r.department?.toLowerCase() ?? '',
  status: (r) => r.status?.toLowerCase() ?? '',
};

function Attendance() {
  const { can } = useAuth();
  const canMark = can(PERMISSIONS.MARK_ATTENDANCE);
  const {
    date,
    setDate,
    filteredRecords,
    summary,
    loading,
    error,
    loadData,
    searchQuery,
    setSearchQuery,
    savingId,
    setStatus,
    clearStatus,
    markAllPresent,
    toast,
  } = useAttendance();

  const { sorted: sortedRecords, sortState, toggleSort } = useSortedList(
    filteredRecords,
    ATTENDANCE_SORT_COMPARATORS
  );

  return (
    <>
      <div className="content-section animate-fade-in-up">
        <div className="content-section-header">
          <div>
            <div className="content-section-title">Attendance</div>
            <div className="content-section-subtitle">
              Track employee attendance and time records for {formatDateReadable(date)}
            </div>
          </div>
          <div className="content-section-actions">
            <input
              type="date"
              className="form-input"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
            />
            {canMark && (
              <Button variant="outline" onClick={markAllPresent}>
                <Icons.UserCheck /> Mark All Present
              </Button>
            )}
          </div>
        </div>
        <div style={{ padding: '20px 24px 0' }}>
          <AttendanceSummary summary={summary} />
        </div>
        <div className="content-section-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
          <div />
          <div className="content-section-actions">
            <input
              type="text"
              className="form-input"
              style={{ width: '220px' }}
              placeholder="Search employee or department…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <AttendanceTable
          records={sortedRecords}
          loading={loading}
          error={error}
          savingId={savingId}
          onSetStatus={setStatus}
          onClearStatus={clearStatus}
          onRetry={loadData}
          sortState={sortState}
          onSort={toggleSort}
          readOnly={!canMark}
        />
      </div>

      <Toast toast={toast} />
    </>
  );
}

export default Attendance;
