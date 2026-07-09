import api from './api';

export async function fetchOverviewReport() {
  const response = await api.get('/reports/overview');
  return response.data;
}
