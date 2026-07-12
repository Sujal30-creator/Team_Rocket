import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfileModal({ onClose }) {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [tab, setTab] = useState('profile');

  // Profile tab state
  const [name, setName]   = useState(user?.name  || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving]   = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // Password tab state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwMsg, setPwMsg]         = useState('');
  const [pwErr, setPwErr]         = useState('');

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileMsg(''); setProfileErr('');
    if (!name.trim()) { setProfileErr('Name is required.'); return; }
    setSaving(true);
    try {
      await updateProfile({ name, email });
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwMsg(''); setPwErr('');
    if (newPw !== confirmPw) { setPwErr('New passwords do not match.'); return; }
    if (newPw.length < 6)   { setPwErr('Password must be at least 6 characters.'); return; }
    setPwSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setPwMsg('Password changed successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwErr(err.message);
    } finally {
      setPwSaving(false);
    }
  }

  function handleSignOut() {
    logout();
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <h2><i className="ti ti-user-circle" style={{ marginRight: 8, color: 'var(--gold)' }} />Account Settings</h2>
          <button className="modal-close" onClick={onClose} id="close-profile-modal">
            <i className="ti ti-x" />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tab-row">
          {[
            { key: 'profile',  label: 'Profile',  icon: 'ti-user' },
            { key: 'password', label: 'Password', icon: 'ti-lock' },
            { key: 'account',  label: 'Account',  icon: 'ti-settings' },
          ].map((t) => (
            <button
              key={t.key}
              className={`modal-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <i className={`ti ${t.icon}`} style={{ marginRight: 5 }} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {/* ── Profile Tab ── */}
          {tab === 'profile' && (
            <form onSubmit={handleProfileSave}>
              {/* Avatar row */}
              <div className="modal-avatar-row">
                <div className="modal-avatar">{getInitials(user?.name)}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>{user?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>{user?.role}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-mid)', marginTop: 4 }}>{user?.email}</div>
                </div>
              </div>

              <div className="modal-section-label"><i className="ti ti-pencil" />Edit Profile</div>

              <div className="modal-field">
                <label>Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="modal-field">
                <label>Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <div className="modal-field">
                <label>Role</label>
                <input value={user?.role || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>

              {profileMsg && <div style={{ color: 'var(--green)', fontSize: 13, marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}><i className="ti ti-circle-check" />{profileMsg}</div>}
              {profileErr && <div className="alert" style={{ margin: '8px 0 0' }}><i className="ti ti-alert-circle" />{profileErr}</div>}

              <div className="modal-footer" style={{ padding: '16px 0 0', border: 'none' }}>
                <button type="button" className="btn" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-profile-btn" disabled={saving}>
                  <i className="ti ti-check" />{saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          )}

          {/* ── Password Tab ── */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordChange}>
              <div className="modal-section-label"><i className="ti ti-lock" />Change Password</div>
              <div className="modal-field">
                <label>Current password</label>
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="modal-field">
                <label>New password</label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••••" />
              </div>
              <div className="modal-field">
                <label>Confirm new password</label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" />
              </div>

              {pwMsg && <div style={{ color: 'var(--green)', fontSize: 13, marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}><i className="ti ti-circle-check" />{pwMsg}</div>}
              {pwErr && <div className="alert" style={{ margin: '8px 0 0' }}><i className="ti ti-alert-circle" />{pwErr}</div>}

              <div className="modal-footer" style={{ padding: '16px 0 0', border: 'none' }}>
                <button type="button" className="btn" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="save-password-btn" disabled={pwSaving}>
                  <i className="ti ti-lock" />{pwSaving ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>
          )}

          {/* ── Account Tab ── */}
          {tab === 'account' && (
            <div>
              <div className="modal-section-label"><i className="ti ti-info-circle" />Session Info</div>
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    { label: 'Name',  value: user?.name },
                    { label: 'Email', value: user?.email },
                    { label: 'Role',  value: user?.role },
                  ].map((r) => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-lo)', fontWeight: 600 }}>{r.label}</span>
                      <span style={{ color: 'var(--text-hi)' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section-label" style={{ color: 'var(--red)' }}><i className="ti ti-logout" />Sign Out</div>
              <p style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 16 }}>
                You'll be logged out of FleetForge. Any unsaved work will be lost.
              </p>
              <button className="btn btn-danger" onClick={handleSignOut} id="signout-btn" style={{ width: '100%', justifyContent: 'center' }}>
                <i className="ti ti-logout" />Sign out of FleetForge
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
