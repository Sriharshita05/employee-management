import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TOKEN_KEY } from '../services/api';
import { login as loginRequest, logout as logoutRequest, fetchCurrentUser } from '../services/authService';
import { hasPermission } from '../utils/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we verify a stored token on first load
  const [error, setError] = useState(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  // On first mount, if a token is already stored, validate it against the
  // API so refreshing the page doesn't kick the admin back to /login.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((currentUser) => setUser(currentUser))
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, [clearSession]);

  // If any API call anywhere in the app gets a 401, api.js broadcasts this
  // event. Log the admin out locally so the UI reacts immediately.
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('ems:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ems:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { user: loggedInUser, token } = await loginRequest(email, password);
      localStorage.setItem(TOKEN_KEY, token);
      setUser(loggedInUser);
      return true;
    } catch (err) {
      const message =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Unable to log in. Please try again.';
      setError(message);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Token may already be invalid/expired — clear local state regardless.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // Role drives the whole RBAC UI: sidebar visibility, action buttons,
  // and route access. `can()` is the single check components should use
  // rather than comparing `role` strings directly everywhere.
  const role = user?.role ?? null;
  const can = useCallback((permission) => hasPermission(role, permission), [role]);

  const value = {
    user,
    role,
    can,
    isAuthenticated: Boolean(user),
    loading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
