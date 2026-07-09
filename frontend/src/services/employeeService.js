import api from './api';

export async function fetchEmployees() {
  const response = await api.get('/employees');
  return response.data;
}

export async function fetchEmployee(id) {
  const response = await api.get(`/employees/${id}`);
  return response.data;
}

export async function createEmployee(data) {
  const response = await api.post('/employees', {
    ...data,
    department_id: Number(data.department_id),
    salary: Number(data.salary),
  });
  return response.data;
}

export async function updateEmployee(id, data) {
  const response = await api.put(`/employees/${id}`, {
    ...data,
    department_id: Number(data.department_id),
    salary: Number(data.salary),
  });
  return response.data;
}

export async function deleteEmployee(id) {
  await api.delete(`/employees/${id}`);
}
