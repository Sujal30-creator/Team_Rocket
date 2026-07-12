import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Fleet Manager');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, role });
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand" style={{ border: 'none', marginBottom: 18, padding: 0 }}>
          <div className="brand-mark">T</div>
          <div>
            <div className="brand-name">TransitOps</div>
            <div className="brand-sub">Fleet control</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="field">
              <label>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          {mode === 'register' && (
            <div className="field">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Fleet Manager</option>
                <option>Safety Officer</option>
                <option>Financial Analyst</option>
                <option>Driver</option>
              </select>
            </div>
          )}

          {error && <div className="alert" style={{ margin: '0 0 14px' }}>{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="login-toggle">
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => setMode('register')}>Register</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode('login')}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
