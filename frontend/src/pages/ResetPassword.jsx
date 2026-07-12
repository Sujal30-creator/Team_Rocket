import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setSuccess('Password has been reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark">F</div>
          <div>
            <div className="login-brand-name">FleetForge</div>
            <div className="login-brand-sub">Fleet OS</div>
          </div>
        </div>

        <div className="login-heading">Set new password</div>
        <div className="login-subheading">Enter your new password below.</div>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <div className="login-field">
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {error && <div className="alert" style={{ margin: '0 0 14px' }}><i className="ti ti-alert-circle" />{error}</div>}
          {success && <div style={{ color: 'var(--green)', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}><i className="ti ti-circle-check" />{success}</div>}

          <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
        
        <div className="login-toggle">
          <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>&larr; Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
