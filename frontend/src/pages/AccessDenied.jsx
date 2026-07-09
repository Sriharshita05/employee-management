import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { Icons } from '../components/common/Icons';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/permissions';
import './AccessDenied.css';

function AccessDenied() {
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="access-denied-screen">
      <div className="access-denied-card animate-fade-in-up">
        <div className="access-denied-icon">
          <Icons.AlertTriangle />
        </div>
        <h1 className="access-denied-title">Access Denied</h1>
        <p className="access-denied-text">
          Your account{role ? ` (${ROLE_LABELS[role] || role})` : ''} doesn&apos;t have
          permission to view this page. If you think this is a mistake, contact an
          administrator.
        </p>
        <div className="access-denied-actions">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
