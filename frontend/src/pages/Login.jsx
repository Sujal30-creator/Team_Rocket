import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]       = useState('login');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]       = useState('Fleet Manager');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else                  await register({ name, email, password, role });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m) { setError(''); setMode(m); }

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-mark">F</div>
          <div>
            <div className="login-brand-name">FleetForge</div>
            <div className="login-brand-sub">Fleet OS</div>
          </div>
        </div>

        <div className="login-heading">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </div>
        <div className="login-subheading">
          {mode === 'login'
            ? 'Sign in to manage your fleet in real-time.'
            : 'Join FleetForge and take control of your fleet.'}
        </div>

        {/* Demo hint on login */}
        {mode === 'login' && (
          <div style={{ background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)', borderRadius: 'var(--radius-sm)', padding: '9px 13px', marginBottom: 20, fontSize: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <i className="ti ti-info-circle" />
            <span>Demo: <b>admin@fleetforge.dev</b> / <b>admin1234</b></span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="login-field">
              <label>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
            </div>
          )}
          <div className="login-field">
            <label>Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          {mode === 'register' && (
            <div className="login-field">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Fleet Manager</option>
                <option>Safety Officer</option>
                <option>Financial Analyst</option>
                <option>Driver</option>
              </select>
            </div>
          )}

          {error && (
            <div className="alert" style={{ margin: '0 0 14px' }}>
              <i className="ti ti-alert-circle" />{error}
            </div>
          )}

          <button className="btn btn-primary login-submit" type="submit" disabled={loading} id="login-submit-btn">
            {loading ? (
              <><span className="spinner-ring" style={{ width: 16, height: 16, borderWidth: 2 }} />Please wait…</>
            ) : mode === 'login' ? (
              <><i className="ti ti-login" />Sign in to FleetForge</>
            ) : (
              <><i className="ti ti-user-plus" />Create account</>
            )}
          </button>
        </form>

        <div className="login-toggle">
          {mode === 'login' ? (
            <>Don&apos;t have an account?{' '}<button onClick={() => switchMode('register')}>Register</button></>
          ) : (
            <>Already have an account?{' '}<button onClick={() => switchMode('login')}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
