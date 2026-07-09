import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isRoleAllowed } from '../../utils/permissions';

/**
 * Guards a route behind authentication and, optionally, a set of
 * allowed roles. Unauthenticated users are sent to /login; authenticated
 * users whose role isn't in `allowedRoles` are sent to /access-denied
 * instead of ever rendering the page.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isRoleAllowed(role, allowedRoles)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}

export default ProtectedRoute;
