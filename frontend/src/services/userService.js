import api from './api';

export async function fetchUsers() {
  const response = await api.get('/users');
  return response.data;
}

export async function createUser(data) {
  const response = await api.post('/users', data);
  return response.data;
}

export async function updateUser(id, data) {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id) {
  await api.delete(`/users/${id}`);
}
