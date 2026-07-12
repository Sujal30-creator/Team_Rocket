import { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';

const empty = { name: '', licenseNumber: '', licenseExpiry: '', phone: '' };

function licenseValid(dateStr) {
  return new Date(dateStr) >= new Date();
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      setForm(empty);
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
          <div className="page-title">Driver management</div>
          <div className="page-desc">Licensing, safety scores, and duty status.</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Add a driver</h3></div>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={handleAdd}>
          <div className="form-grid">
            <div className="field"><label>Full name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Anita Rao" />
            </div>
            <div className="field"><label>License number</label>
              <input value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} placeholder="MH-DL-2023-0155" />
            </div>
            <div className="field"><label>License expiry</label>
              <input type="date" value={form.licenseExpiry} onChange={(e) => set('licenseExpiry', e.target.value)} />
            </div>
            <div className="field"><label>Phone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 90000 00000" />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              <i className="ti ti-plus"></i>{saving ? 'Saving…' : 'Add driver'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Roster ({drivers.length})</h3></div>
        {loading ? (
          <div className="spinner-text">Loading…</div>
        ) : drivers.length === 0 ? (
          <div className="empty">No drivers added yet.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Name</th><th>License</th><th>Expiry</th><th>Safety score</th><th>Status</th></tr>
            </thead>
            <tbody>
              {drivers.map((d) => {
                const expired = !licenseValid(d.licenseExpiry);
                return (
                  <tr key={d._id}>
                    <td>{d.name}</td>
                    <td className="mono">{d.licenseNumber}</td>
                    <td className="mono" style={{ color: expired ? 'var(--red)' : 'var(--text-mid)' }}>
                      {d.licenseExpiry.slice(0, 10)}{expired ? ' · expired' : ''}
                    </td>
                    <td>{d.safetyScore}</td>
                    <td><Badge status={d.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
