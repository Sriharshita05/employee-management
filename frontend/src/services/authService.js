import api from './api';

export async function login(email, password) {
  const response = await api.post('/login', { email, password });
  return response.data; // { user, token }
}

export async function logout() {
  await api.post('/logout');
}

export async function fetchCurrentUser() {
  const response = await api.get('/user');
  return response.data;
}
