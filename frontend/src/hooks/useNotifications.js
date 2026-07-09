import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchEmployees } from '../services/employeeService';
import { fetchDepartments } from '../services/departmentService';
import { fetchAttendanceSummary } from '../services/attendanceService';
import { getReadIds, markRead, markAllRead } from '../utils/notificationsStore';
import { useSettings } from './useSettings';
import { todayISO } from '../utils/constants';

const NEW_HIRE_WINDOW_DAYS = 14;
const UPDATED_WINDOW_DAYS = 5;

function daysAgo(dateStr) {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
}

export function useNotifications() {
  const { settings } = useSettings();
  const [rawNotifications, setRawNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => getReadIds());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [employees, departments, attendanceSummary] = await Promise.all([
        fetchEmployees(),
        fetchDepartments(),
        fetchAttendanceSummary(todayISO()),
      ]);

      const items = [];

      employees.forEach((emp) => {
        if (emp.created_at && daysAgo(emp.created_at) <= NEW_HIRE_WINDOW_DAYS) {
          items.push({
            id: `new-hire-${emp.id}`,
            type: 'new_hire',
            title: 'New employee added',
            message: `${emp.name} joined the organization.`,
            timestamp: emp.created_at,
          });
        } else if (
          emp.updated_at &&
          emp.updated_at !== emp.created_at &&
          daysAgo(emp.updated_at) <= UPDATED_WINDOW_DAYS
        ) {
          items.push({
            id: `updated-${emp.id}-${emp.updated_at}`,
            type: 'new_hire',
            title: 'Employee record updated',
            message: `${emp.name}'s details were recently updated.`,
            timestamp: emp.updated_at,
          });
        }
      });

      departments.forEach((dept) => {
        if ((dept.employee_count || 0) === 0) {
          items.push({
            id: `empty-dept-${dept.id}`,
            type: 'department',
            title: 'Department has no employees',
            message: `"${dept.name}" doesn't have anyone assigned yet.`,
            timestamp: dept.updated_at || dept.created_at || new Date().toISOString(),
          });
        }
      });

      if (attendanceSummary && attendanceSummary.not_marked > 0) {
        items.push({
          id: `attendance-pending-${attendanceSummary.date}`,
          type: 'attendance',
          title: 'Attendance pending',
          message: `${attendanceSummary.not_marked} employee(s) haven't been marked for today.`,
          timestamp: new Date().toISOString(),
        });
      }

      if (attendanceSummary && attendanceSummary.absent > 0) {
        items.push({
          id: `attendance-absent-${attendanceSummary.date}`,
          type: 'attendance',
          title: 'Absences today',
          message: `${attendanceSummary.absent} employee(s) marked absent today.`,
          timestamp: new Date().toISOString(),
        });
      }

      items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRawNotifications(items);
      setReadIds(getReadIds());
    } catch (err) {
      console.error('Failed to build notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const notifications = useMemo(() => {
    const prefs = settings.notificationPrefs;
    return rawNotifications
      .filter((n) => {
        if (n.type === 'new_hire') return prefs.newHires;
        if (n.type === 'attendance') return prefs.attendanceAlerts;
        if (n.type === 'department') return prefs.departmentAlerts;
        return true;
      })
      .map((n) => ({ ...n, read: readIds.includes(n.id) }));
  }, [rawNotifications, readIds, settings.notificationPrefs]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markOneAsRead = useCallback((id) => {
    setReadIds(markRead(id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds(markAllRead(notifications.map((n) => n.id)));
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    reload: load,
    markOneAsRead,
    markAllAsRead,
  };
}
