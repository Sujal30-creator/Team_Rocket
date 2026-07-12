import { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

const EMPTY = {
  registrationNumber: '',
  name: '',
  type: 'Truck',
  loadCapacityKg: '',
  odometerKm: '',
  acquisitionCost: '',
};

const TYPE_ICONS = {
  Truck:   '🚛',
  Van:     '🚐',
  Trailer: '🚚',
  Tempo:   '🛺',
  SUV:     '🚙',
  Other:   '📦'
};

function statusClass(status) {
  if (status === 'Available') return 'available';
  if (status === 'On Trip')   return 'ontrip';
  if (status === 'In Shop')   return 'shop';
  if (status === 'Retired')   return 'offduty';
  return '';
}

export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setVehicles(await api.getVehicles());
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
    if (!form.registrationNumber || !form.name || !form.loadCapacityKg) {
      setError('Registration, name, and capacity are required.');
      return;
    }
    setSaving(true);
    try {
      await api.createVehicle({
        registrationNumber: form.registrationNumber,
        name:               form.name,
        type:               form.type,
        loadCapacityKg:     Number(form.loadCapacityKg),
        odometerKm:         Number(form.odometerKm) || 0,
        acquisitionCost:    Number(form.acquisitionCost) || 0,
      });
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Group vehicles by type
  const groupedVehicles = vehicles.reduce((acc, v) => {
    if (!acc[v.type]) acc[v.type] = [];
    acc[v.type].push(v);
    return acc;
  }, {});

  // Sort the keys so they appear in a consistent order
  const orderedTypes = ['Truck', 'Trailer', 'Van', 'Tempo', 'SUV', 'Other'].filter(t => groupedVehicles[t]);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Fleet</div>
          <div className="page-desc">Manage your entire fleet of vehicles, segregated by category.</div>
        </div>
        <button className="btn btn-primary" id="add-vehicle-btn" onClick={() => setShowForm((v) => !v)}>
          <i className={`ti ${showForm ? 'ti-x' : 'ti-plus'}`} />
          {showForm ? 'Cancel' : 'Register vehicle'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-head">
            <h3><i className="ti ti-truck" style={{ marginRight: 8, color: 'var(--cyan)' }} />Register a vehicle</h3>
          </div>
          {error && <div className="alert"><i className="ti ti-alert-circle" />{error}</div>}
          <form onSubmit={handleAdd}>
            <div className="form-grid">
              <div className="field">
                <label>Registration no.</label>
                <input value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value.toUpperCase())} placeholder="MH12AB1234" />
              </div>
              <div className="field">
                <label>Vehicle name</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Truck 07" />
              </div>
              <div className="field">
                <label>Type</label>
                <select value={form.type} onChange={(e) => set('type', e.target.value)}>
                  <option>Truck</option>
                  <option>Trailer</option>
                  <option>Van</option>
                  <option>Tempo</option>
                  <option>SUV</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label>Load capacity (kg)</label>
                <input type="number" value={form.loadCapacityKg} onChange={(e) => set('loadCapacityKg', e.target.value)} placeholder="8000" />
              </div>
              <div className="field">
                <label>Odometer (km)</label>
                <input type="number" value={form.odometerKm} onChange={(e) => set('odometerKm', e.target.value)} placeholder="0" />
              </div>
              <div className="field">
                <label>Acquisition cost (₹)</label>
                <input type="number" value={form.acquisitionCost} onChange={(e) => set('acquisitionCost', e.target.value)} placeholder="1850000" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={saving} id="save-vehicle-btn">
                <i className="ti ti-check" />{saving ? 'Saving…' : 'Register vehicle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fleet Display */}
      {loading ? (
        <Spinner text="Loading fleet…" />
      ) : vehicles.length === 0 ? (
        <div className="panel">
          <div className="empty">
            <i className="ti ti-truck-off" />
            No vehicles registered yet.
          </div>
        </div>
      ) : (
        orderedTypes.map(type => (
          <div className="panel" key={type} style={{ marginBottom: 24 }}>
            <div className="panel-head" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
                <span style={{ fontSize: 24 }}>{TYPE_ICONS[type]}</span>
                {type}s
                <span style={{ fontSize: 12, background: 'var(--bg-3)', color: 'var(--text-hi)', padding: '2px 8px', borderRadius: 100 }}>
                  {groupedVehicles[type].length}
                </span>
              </h3>
            </div>
            <div className="vehicle-grid">
              {groupedVehicles[type].map((v, i) => (
                <div
                  key={v._id}
                  className={`vehicle-card status-${statusClass(v.status)}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="vehicle-card-header">
                    <div className="vehicle-reg mono" style={{ fontSize: 16, fontWeight: 700 }}>{v.registrationNumber}</div>
                    <Badge status={v.status} />
                  </div>
                  <div className="vehicle-name" style={{ marginBottom: 12, fontSize: 14, color: 'var(--text-lo)' }}>
                    {v.name}
                  </div>
                  <div className="vehicle-meta">
                    <span><i className="ti ti-weight" />{v.loadCapacityKg.toLocaleString()} kg Capacity</span>
                    <span><i className="ti ti-road" />{v.odometerKm.toLocaleString()} km</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
