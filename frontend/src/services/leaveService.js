import api from './api';

// List endpoints return Laravel's paginated resource shape:
// { data: [...], meta: { current_page, last_page, per_page, total } }
export async function fetchLeaveRequests(params = {}) {
  const response = await api.get('/leave-requests', { params });
  return response.data;
}

export async function createLeaveRequest(data) {
  const response = await api.post('/leave-requests', {
    ...data,
    employee_id: Number(data.employee_id),
  });
  return response.data.data;
}

export async function approveLeaveRequest(id, decisionNote) {
  const response = await api.post(`/leave-requests/${id}/approve`, {
    decision_note: decisionNote || null,
  });
  return response.data.data;
}

export async function rejectLeaveRequest(id, decisionNote) {
  const response = await api.post(`/leave-requests/${id}/reject`, {
    decision_note: decisionNote,
  });
  return response.data.data;
}

export async function cancelLeaveRequest(id) {
  const response = await api.post(`/leave-requests/${id}/cancel`);
  return response.data.data;
}

export async function fetchLeaveBalance(employeeId, year) {
  const response = await api.get(`/leave-balances/${employeeId}`, { params: { year } });
  return response.data;
}
