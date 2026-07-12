import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

import TripStepper from '../components/TripStepper';

const EMPTY = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '' };

function getDistance(cityA, cityB, vehicleId) {
  if (!cityA || !cityB) return 9999;
  const a = cityA.toLowerCase().trim();
  const b = cityB.toLowerCase().trim();
  if (a === b) return 0;
  // consistent mock hash distance utilizing vehicleId to ensure variety
  const str = (a < b ? a + b : b + a) + (vehicleId || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return (Math.abs(hash) % 800) + 15; // 15 to 815 km
}

export default function Trips() {
  const [trips, setTrips]       = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers]   = useState([]);
  
  const [form, setForm]         = useState(EMPTY);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Edit state
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ source: '', destination: '' });

  async function load() {
    setLoading(true);
    try {
      const [t, v, d] = await Promise.all([
        api.getTrips(),
        api.getVehicles('Available'),
        api.getDrivers('Available'),
      ]);
      setTrips(t);
      setVehicles(v);
      setDrivers(d.filter((driver) => new Date(driver.licenseExpiry) >= new Date()));
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

  async function handleDispatch(e) {
    e.preventDefault();
    setError('');
    if (!form.source || !form.destination || !form.vehicleId || !form.driverId || !form.cargoWeightKg) {
      setError('Fill in source, destination, vehicle, driver, and cargo weight.');
      return;
    }
    setSaving(true);
    try {
      await api.dispatchTrip({ ...form, cargoWeightKg: Number(form.cargoWeightKg) });
      setForm(EMPTY);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function finish(id, outcome) {
    try {
      await api.finishTrip(id, outcome);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(e, id) {
    e.preventDefault();
    try {
      await api.updateTrip(id, editForm);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to permanently delete this trip?')) return;
    try {
      await api.deleteTrip(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const active = trips.filter((t) => ['Draft', 'Dispatched', 'On Trip'].includes(t.status));
  const past   = trips.filter((t) => ['Completed', 'Cancelled'].includes(t.status));

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Trip Management</div>
          <div className="page-desc">Draft trips, dispatch them, and track delivery progress.</div>
        </div>
        <button className="btn btn-primary" id="dispatch-trip-btn" onClick={() => setShowForm((v) => !v)}>
          <i className={`ti ${showForm ? 'ti-x' : 'ti-plus'}`} />
          {showForm ? 'Cancel' : 'Create trip'}
        </button>
      </div>

      {/* Dispatch form */}
      {showForm && (
        <div className="panel" style={{ marginBottom: 24 }}>
          <div className="panel-head">
            <h3><i className="ti ti-route" style={{ marginRight: 8, color: 'var(--gold)' }} />Draft a New Trip</h3>
          </div>
          {error && <div className="alert"><i className="ti ti-alert-circle" />{error}</div>}
          <form onSubmit={handleDispatch}>
            <div className="form-grid">
              <div className="field">
                <label>Source</label>
                <input value={form.source} onChange={(e) => set('source', e.target.value)} placeholder="Mumbai" />
              </div>
              <div className="field">
                <label>Destination</label>
                <input value={form.destination} onChange={(e) => set('destination', e.target.value)} placeholder="Pune" />
              </div>
              <div className="field">
                <label>Vehicle (Nearest First)</label>
                <select value={form.vehicleId} onChange={(e) => set('vehicleId', e.target.value)}>
                  <option value="">Select available vehicle</option>
                  {vehicles
                    .map(v => ({ ...v, distance: getDistance(form.source, v.currentLocation, v._id) }))
                    .sort((a, b) => a.distance - b.distance)
                    .map((v, i) => (
                      <option key={v._id} value={v._id}>
                        {v.distance === 0 ? '📍 ' : i === 0 ? '⭐️ Nearest: ' : ''}
                        {v.name} · {v.type} ({v.distance === 0 ? 'In City' : `${v.distance} km away`})
                      </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Driver</label>
                <select value={form.driverId} onChange={(e) => set('driverId', e.target.value)}>
                  <option value="">Select available driver</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Cargo weight (kg)</label>
                <input type="number" value={form.cargoWeightKg} onChange={(e) => set('cargoWeightKg', e.target.value)} placeholder="450" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <i className="ti ti-check" />{saving ? 'Saving…' : 'Save as Draft'}
              </button>
              {vehicles.length === 0 && (
                <span style={{ fontSize: 12, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className="ti ti-alert-triangle" />
                  No vehicles available.
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Active trips */}
      {active.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div className="section-label">Active Trips</div>
            <div className="live-dot" />
          </div>
          {active.map((t, i) => (
            <div className={`trip-card ${t.status === 'Dispatched' || t.status === 'On Trip' ? 'running' : ''}`} key={t._id} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="trip-top">
                <Link to={`/trips/${t._id}`} className="trip-id" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
                  TRIP-{t._id.slice(-6).toUpperCase()} · {new Date(t.createdAt).toISOString().slice(0, 10)}
                </Link>
                <Badge status={t.status} />
              </div>

              {/* Edit Address Form inline */}
              {editId === t._id ? (
                <form onSubmit={(e) => handleUpdate(e, t._id)} style={{ display: 'flex', gap: 10, margin: '16px 0', background: 'var(--bg-2)', padding: 12, borderRadius: 8 }}>
                  <input value={editForm.source} onChange={e => setEditForm({ ...editForm, source: e.target.value })} placeholder="Source" required style={{ flex: 1 }} />
                  <i className="ti ti-arrow-right" style={{ alignSelf: 'center', color: 'var(--text-lo)' }} />
                  <input value={editForm.destination} onChange={e => setEditForm({ ...editForm, destination: e.target.value })} placeholder="Destination" required style={{ flex: 1 }} />
                  <button type="submit" className="btn btn-sm btn-primary"><i className="ti ti-check" />Save</button>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditId(null)}><i className="ti ti-x" /></button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', margin: '8px 0 16px', fontSize: 18, fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                  <span>{t.source}</span>
                  <i className="ti ti-arrow-right" style={{ color: 'var(--gold)', fontSize: 14 }} />
                  <span>{t.destination}</span>
                  {t.status === 'Draft' && (
                    <button className="btn btn-sm btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setEditId(t._id); setEditForm({ source: t.source, destination: t.destination }); }}>
                      <i className="ti ti-edit" />
                    </button>
                  )}
                </div>
              )}

              <TripStepper status={t.status} />

              <div className="trip-meta" style={{ marginTop: 16 }}>
                <span><i className="ti ti-truck" style={{ marginRight: 4, color: 'var(--text-lo)' }} />Vehicle <b>{t.vehicle?.name}</b></span>
                <span><i className="ti ti-user" style={{ marginRight: 4, color: 'var(--text-lo)' }} />Driver <b>{t.driver?.name}</b></span>
                <span><i className="ti ti-package" style={{ marginRight: 4, color: 'var(--text-lo)' }} />Cargo <b>{t.cargoWeightKg.toLocaleString()} kg</b></span>
              </div>
              
              <div className="trip-actions">
                {t.status === 'Draft' && (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => finish(t._id, 'Dispatched')}>
                      <i className="ti ti-send" />Dispatch
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => finish(t._id, 'Cancelled')}>
                      <i className="ti ti-x" />Cancel
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(t._id)}>
                      <i className="ti ti-trash" style={{ color: 'var(--red)' }} />
                    </button>
                  </>
                )}
                {t.status === 'Dispatched' && (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => finish(t._id, 'On Trip')}>
                      <i className="ti ti-truck-delivery" />Mark On Trip
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(t._id)}>
                      <i className="ti ti-trash" style={{ color: 'var(--red)' }} />
                    </button>
                  </>
                )}
                {t.status === 'On Trip' && (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={() => finish(t._id, 'Completed')}>
                      <i className="ti ti-check" />Complete
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(t._id)}>
                      <i className="ti ti-trash" style={{ color: 'var(--red)' }} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Past trips */}
      {loading ? (
        <Spinner text="Loading trips…" />
      ) : (
        <>
          {past.length > 0 && (
            <div className="section-label" style={{ marginBottom: 14 }}>
              Past Trips ({past.length})
            </div>
          )}
          {past.length === 0 && active.length === 0 && (
            <div className="panel">
              <div className="empty">
                <i className="ti ti-route" />
                No trips yet. Create your first draft above.
              </div>
            </div>
          )}
          {past.map((t, i) => (
            <div className="trip-card" key={t._id} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="trip-top">
                <Link to={`/trips/${t._id}`} className="trip-id" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
                  TRIP-{t._id.slice(-6).toUpperCase()} · {new Date(t.createdAt).toISOString().slice(0, 10)}
                </Link>
                <Badge status={t.status} />
              </div>
              
              <div style={{ textAlign: 'center', margin: '8px 0 16px', fontSize: 18, fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                <span>{t.source}</span>
                <i className="ti ti-arrow-right" style={{ color: 'var(--gold)', fontSize: 14 }} />
                <span>{t.destination}</span>
              </div>

              <TripStepper status={t.status} />

              <div className="trip-meta" style={{ marginTop: 16 }}>
                <span>Vehicle <b>{t.vehicle?.name}</b></span>
                <span>Driver <b>{t.driver?.name}</b></span>
                <span>Cargo <b>{t.cargoWeightKg.toLocaleString()} kg</b></span>
              </div>
              
              <div className="trip-actions">
                <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(t._id)}>
                  <i className="ti ti-trash" style={{ color: 'var(--red)' }} /> Delete Record
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
