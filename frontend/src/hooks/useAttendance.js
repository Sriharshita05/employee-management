import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteAttendance,
  fetchAttendanceByDate,
  fetchAttendanceSummary,
  markAttendance,
} from '../services/attendanceService';
import { todayISO } from '../utils/constants';

export function useAttendance() {
  const [date, setDate] = useState(todayISO());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [attendanceRes, summaryRes] = await Promise.all([
        fetchAttendanceByDate(date),
        fetchAttendanceSummary(date),
      ]);
      setRecords(attendanceRes.data);
      setSummary(summaryRes);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setError(err.message || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return records;
    return records.filter(
      (r) =>
        r.employee_name?.toLowerCase().includes(query) ||
        r.department?.toLowerCase().includes(query)
    );
  }, [records, searchQuery]);

  const setStatus = useCallback(
    async (employeeId, status) => {
      setSavingId(employeeId);
      try {
        const updated = await markAttendance({ employee_id: employeeId, date, status });
        setRecords((prev) =>
          prev.map((r) =>
            r.employee_id === employeeId
              ? {
                  ...r,
                  attendance_id: updated.id,
                  status: updated.status,
                  check_in: updated.check_in,
                  check_out: updated.check_out,
                }
              : r
          )
        );
        // Refresh summary counts after a change.
        const summaryRes = await fetchAttendanceSummary(date);
        setSummary(summaryRes);
      } catch (err) {
        console.error('Error marking attendance:', err);
        showToast(err.response?.data?.message || 'Failed to update attendance.', 'error');
      } finally {
        setSavingId(null);
      }
    },
    [date, showToast]
  );

  const clearStatus = useCallback(
    async (employeeId, attendanceId) => {
      if (!attendanceId) return;
      setSavingId(employeeId);
      try {
        await deleteAttendance(attendanceId);
        setRecords((prev) =>
          prev.map((r) =>
            r.employee_id === employeeId
              ? { ...r, attendance_id: null, status: null, check_in: null, check_out: null }
              : r
          )
        );
        const summaryRes = await fetchAttendanceSummary(date);
        setSummary(summaryRes);
      } catch (err) {
        console.error('Error clearing attendance:', err);
        showToast('Failed to clear attendance.', 'error');
      } finally {
        setSavingId(null);
      }
    },
    [date, showToast]
  );

  const markAllPresent = useCallback(async () => {
    const unmarked = records.filter((r) => !r.status);
    if (unmarked.length === 0) {
      showToast('Everyone already has a status for this date.', 'error');
      return;
    }
    try {
      await Promise.all(
        unmarked.map((r) => markAttendance({ employee_id: r.employee_id, date, status: 'present' }))
      );
      showToast(`Marked ${unmarked.length} employee(s) as present.`);
      await loadData();
    } catch (err) {
      console.error('Error bulk marking attendance:', err);
      showToast('Failed to mark all present.', 'error');
    }
  }, [records, date, showToast, loadData]);

  return {
    date,
    setDate,
    records,
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
  };
}
