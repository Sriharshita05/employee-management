import api from './api';

export async function fetchDepartments() {
  const response = await api.get('/departments');
  return response.data;
}

export async function fetchDepartment(id) {
  const response = await api.get(`/departments/${id}`);
  return response.data;
}

export async function createDepartment(data) {
  const response = await api.post('/departments', data);
  return response.data;
}

export async function updateDepartment(id, data) {
  const response = await api.put(`/departments/${id}`, data);
  return response.data;
}

export async function deleteDepartment(id) {
  await api.delete(`/departments/${id}`);
}
