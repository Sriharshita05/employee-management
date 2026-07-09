import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ROLES } from './utils/permissions';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Documentation from './pages/Documentation';
import Help from './pages/Help';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import AccessDenied from './pages/AccessDenied';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route
              path="employees/:id/edit"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.HR]}>
                  <Employees />
                </ProtectedRoute>
              }
            />

            {/* Departments: read-only for admin/hr per RBAC — the page
                itself hides manage controls for non-admins, but hr/manager
                still need to reach it to view department info. Managers
                aren't listed as having a departments permission, so they're
                redirected to Access Denied. */}
            <Route
              path="departments"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.HR]}>
                  <Departments />
                </ProtectedRoute>
              }
            />

            <Route path="attendance" element={<Attendance />} />

            {/* Reports: admin-only per the permission table. */}
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Manage Users: admin-only. */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route path="settings" element={<Settings />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="help" element={<Help />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="access-denied" element={<AccessDenied />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
