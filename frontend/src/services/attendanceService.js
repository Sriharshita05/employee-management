import api from './api';

export async function fetchAttendanceByDate(date) {
  const response = await api.get('/attendance', { params: { date } });
  return response.data;
}

export async function fetchAttendanceSummary(date) {
  const response = await api.get('/attendance/summary', { params: { date } });
  return response.data;
}

export async function markAttendance(data) {
  const response = await api.post('/attendance', data);
  return response.data;
}

export async function deleteAttendance(id) {
  await api.delete(`/attendance/${id}`);
}
