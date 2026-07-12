import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

function generateCaptcha() {
  const n1 = Math.floor(Math.random() * 10) + 1;
  const n2 = Math.floor(Math.random() * 10) + 1;
  return { text: `What is ${n1} + ${n2}?`, answer: String(n1 + n2) };
}

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [mode, setMode]       = useState('login'); // 'login', 'register', 'forgot'
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]       = useState('Fleet Manager');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Refresh captcha on mode change
    if (mode === 'login' || mode === 'register') {
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
    }
    setError('');
    setSuccess('');
  }, [mode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    
    // Captcha check
    if (mode !== 'forgot' && captchaInput !== captcha.answer) {
      setError('Incorrect captcha answer. Try again.');
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password, rememberMe);
        navigate('/');
      } else if (mode === 'register') {
        await register({ name, email, password, role });
        navigate('/');
      } else if (mode === 'forgot') {
        const res = await api.forgotPassword(email);
        setSuccess(res.message || 'Password reset link sent to your email.');
      }
    } catch (err) {
      setError(err.message);
      if (mode !== 'forgot') {
        setCaptcha(generateCaptcha());
        setCaptchaInput('');
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m) { setMode(m); }

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
          {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create account' : 'Reset password'}
        </div>
        <div className="login-subheading">
          {mode === 'login'
            ? 'Sign in to manage your fleet in real-time.'
            : mode === 'register' 
              ? 'Join FleetForge and take control of your fleet.'
              : 'Enter your email to receive a password reset link.'}
        </div>

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
          
          {mode !== 'forgot' && (
            <div className="login-field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
          )}

          {mode === 'register' && (
            <div className="login-field">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Fleet Manager</option>
                <option>Dispatcher</option>
                <option>Safety Officer</option>
                <option>Financial Analyst</option>
              </select>
            </div>
          )}

          {mode === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 13 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-mid)', cursor: 'pointer' }}>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: 14, height: 14, cursor: 'pointer' }} />
                Remember me
              </label>
              <button type="button" onClick={() => switchMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}>
                Forgot password?
              </button>
            </div>
          )}

          {mode !== 'forgot' && (
            <div className="login-field" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label>Security Check: {captcha.text}</label>
                <input type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Answer" required />
              </div>
            </div>
          )}

          {error && <div className="alert" style={{ margin: '0 0 14px' }}><i className="ti ti-alert-circle" />{error}</div>}
          {success && <div style={{ color: 'var(--green)', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}><i className="ti ti-circle-check" />{success}</div>}

          <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
            {loading ? (
              <><span className="spinner-ring" style={{ width: 16, height: 16, borderWidth: 2 }} />Please wait…</>
            ) : mode === 'login' ? (
              <><i className="ti ti-login" />Sign in</>
            ) : mode === 'register' ? (
              <><i className="ti ti-user-plus" />Create account</>
            ) : (
              <><i className="ti ti-mail" />Send reset link</>
            )}
          </button>
        </form>

        <div className="login-toggle">
          {mode === 'login' ? (
            <>Don&apos;t have an account?{' '}<button onClick={() => switchMode('register')}>Register</button></>
          ) : (
            <><button onClick={() => switchMode('login')}>&larr; Back to sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}
