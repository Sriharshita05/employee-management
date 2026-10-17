import api from './api';

// Returns { data: [...], meta: { current_page, last_page, per_page, total } }
export async function fetchAuditLogs(params = {}) {
  const response = await api.get('/audit-logs', { params });
  return response.data;
}
