import axios from 'axios';

const TOKEN_KEY = 'ems_admin_token';

const api = axios.create({
  baseURL:  `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Attach the admin's Sanctum bearer token (if any) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is missing/expired/revoked, the API replies 401. Clear the
// stored token and broadcast an event so AuthContext can redirect to /login
// without api.js needing to import React/router code directly.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('ems:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export { TOKEN_KEY };
export default api;
