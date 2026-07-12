import { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

const EMPTY = { name: '', licenseNumber: '', licenseExpiry: '', phone: '' };

function licenseValid(dateStr) {
  return new Date(dateStr) >= new Date();
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function safetyColor(score) {
  if (score >= 80) return 'var(--green)';
  if (score >= 50) return 'var(--amber)';
  return 'var(--red)';
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm]       = useState(EMPTY);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setDrivers(await api.getDrivers());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.licenseNumber || !form.licenseExpiry) {
      setError('Name, license number, and expiry date are required.');
      return;
    }
    setSaving(true);
    try {
      await api.createDriver(form);
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Driver Management</div>
          <div className="page-desc">Licensing, safety scores, and duty status.</div>
        </div>
        <button className="btn btn-primary" id="add-driver-btn" onClick={() => setShowForm((v) => !v)}>
          <i className={`ti ${showForm ? 'ti-x' : 'ti-user-plus'}`} />
          {showForm ? 'Cancel' : 'Add driver'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-head">
            <h3><i className="ti ti-user-plus" style={{ marginRight: 8, color: 'var(--cyan)' }} />Add a driver</h3>
          </div>
          {error && <div className="alert"><i className="ti ti-alert-circle" />{error}</div>}
          <form onSubmit={handleAdd}>
            <div className="form-grid">
              <div className="field">
                <label>Full name</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Anita Rao" />
              </div>
              <div className="field">
                <label>License number</label>
                <input value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} placeholder="MH-DL-2023-0155" />
              </div>
              <div className="field">
                <label>License expiry</label>
                <input type="date" value={form.licenseExpiry} onChange={(e) => set('licenseExpiry', e.target.value)} />
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 90000 00000" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={saving} id="save-driver-btn">
                <i className="ti ti-check" />{saving ? 'Saving…' : 'Add driver'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roster */}
      <div className="panel">
        <div className="panel-head">
          <h3>
            <i className="ti ti-users" style={{ marginRight: 8, color: 'var(--cyan)' }} />
            Roster
            <span style={{ marginLeft: 8, fontSize: 12, background: 'var(--cyan-bg)', color: 'var(--cyan)', padding: '2px 8px', borderRadius: 100, border: '1px solid rgba(34,211,238,0.2)' }}>
              {drivers.length}
            </span>
          </h3>
        </div>
        {loading ? (
          <Spinner text="Loading roster…" />
        ) : drivers.length === 0 ? (
          <div className="empty">
            <i className="ti ti-user-off" />
            No drivers added yet.
          </div>
        ) : (
          <div>
            {drivers.map((d, i) => {
              const expired = !licenseValid(d.licenseExpiry);
              return (
                <div className="driver-card" key={d._id} style={{ animationDelay: `${i * 50}ms` }}>
                  {/* Avatar */}
                  <div className="driver-avatar">{getInitials(d.name)}</div>

                  {/* Info */}
                  <div>
                    <div className="driver-name">{d.name}</div>
                    <div className="driver-license">{d.licenseNumber}</div>
                    {expired ? (
                      <div className="license-expired">
                        <i className="ti ti-alert-triangle" />
                        Expired {d.licenseExpiry.slice(0, 10)}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: 'var(--text-lo)', marginTop: 2 }}>
                        Expires {d.licenseExpiry.slice(0, 10)}
                      </div>
                    )}
                    {/* Safety score bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <div className="safety-bar">
                        <div
                          className="safety-fill"
                          style={{ width: `${d.safetyScore}%`, background: safetyColor(d.safetyScore) }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: safetyColor(d.safetyScore), fontWeight: 600 }}>
                        {d.safetyScore}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <Badge status={d.status} />
                    {d.phone && (
                      <span style={{ fontSize: 11, color: 'var(--text-lo)', fontFamily: 'var(--font-mono)' }}>
                        {d.phone}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
