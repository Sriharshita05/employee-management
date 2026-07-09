import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginBg from '../assets/login-bg.jpg';
import './Login.css';

function Login() {
  const { login, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Already logged in (or a stored token just verified) — skip the form.
  if (!loading && isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);

    if (success) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `radial-gradient(circle at 15% 20%, rgba(170, 28, 65, 0.10), transparent 45%), radial-gradient(circle at 85% 80%, rgba(184, 145, 199, 0.08), transparent 45%), url(${loginBg})`,
      }}
    >
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">EM</div>
          <span className="login-brand-text">EmpManage</span>
        </div>

        <h1 className="login-title">Admin Sign In</h1>
        <p className="login-subtitle">Enter your credentials to access the dashboard.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div className="login-password-field">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((show) => !show)}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
