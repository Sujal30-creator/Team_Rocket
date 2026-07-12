import { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

const EMPTY = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '' };

export default function Trips() {
  const [trips, setTrips]       = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers]   = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);

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

  const running   = trips.filter((t) => t.status === 'Running');
  const completed = trips.filter((t) => t.status !== 'Running');

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Trip Management</div>
          <div className="page-desc">Dispatch trips, then complete or cancel to release the vehicle and driver.</div>
        </div>
        <button className="btn btn-primary" id="dispatch-trip-btn" onClick={() => setShowForm((v) => !v)}>
          <i className={`ti ${showForm ? 'ti-x' : 'ti-send'}`} />
          {showForm ? 'Cancel' : 'Dispatch trip'}
        </button>
      </div>

      {/* Dispatch form */}
      {showForm && (
        <div className="panel">
          <div className="panel-head">
            <h3><i className="ti ti-send" style={{ marginRight: 8, color: 'var(--cyan)' }} />Create a Trip</h3>
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
                <label>Vehicle</label>
                <select value={form.vehicleId} onChange={(e) => set('vehicleId', e.target.value)}>
                  <option value="">Select available vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>{v.name} · {v.registrationNumber} ({v.loadCapacityKg.toLocaleString()} kg)</option>
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
                <i className="ti ti-send" />{saving ? 'Dispatching…' : 'Dispatch trip'}
              </button>
              {vehicles.length === 0 && (
                <span style={{ fontSize: 12, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className="ti ti-alert-triangle" />
                  No vehicles available — check Maintenance tab.
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Running trips */}
      {running.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div className="section-label">Live Trips</div>
            <div className="live-dot" />
          </div>
          {running.map((t, i) => (
            <div className="trip-card running" key={t._id} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="trip-top">
                <span className="trip-id">TRIP-{t._id.slice(-6).toUpperCase()} · {new Date(t.createdAt).toISOString().slice(0, 10)}</span>
                <Badge status={t.status} />
              </div>
              <div className="route">
                <span className="route-point">{t.source}</span>
                <span className="route-line active">
                  <span className="route-truck">🚚</span>
                </span>
                <span className="route-point">{t.destination}</span>
              </div>
              <div className="trip-meta">
                <span><i className="ti ti-truck" style={{ marginRight: 4, color: 'var(--text-lo)' }} />Vehicle <b>{t.vehicle?.name} · {t.vehicle?.registrationNumber}</b></span>
                <span><i className="ti ti-user" style={{ marginRight: 4, color: 'var(--text-lo)' }} />Driver <b>{t.driver?.name}</b></span>
                <span><i className="ti ti-package" style={{ marginRight: 4, color: 'var(--text-lo)' }} />Cargo <b>{t.cargoWeightKg.toLocaleString()} kg</b></span>
              </div>
              <div className="trip-actions">
                <button className="btn btn-sm" id={`complete-trip-${t._id}`} onClick={() => finish(t._id, 'Completed')}>
                  <i className="ti ti-check" />Complete trip
                </button>
                <button className="btn btn-sm btn-danger" id={`cancel-trip-${t._id}`} onClick={() => finish(t._id, 'Cancelled')}>
                  <i className="ti ti-x" />Cancel trip
                </button>
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
          {completed.length > 0 && (
            <div className="section-label" style={{ marginBottom: 14 }}>
              Past Trips ({completed.length})
            </div>
          )}
          {completed.length === 0 && running.length === 0 && (
            <div className="panel">
              <div className="empty">
                <i className="ti ti-route" />
                No trips yet. Dispatch your first trip above.
              </div>
            </div>
          )}
          {completed.map((t, i) => (
            <div className="trip-card" key={t._id} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="trip-top">
                <span className="trip-id">TRIP-{t._id.slice(-6).toUpperCase()} · {new Date(t.createdAt).toISOString().slice(0, 10)}</span>
                <Badge status={t.status} />
              </div>
              <div className="route">
                <span className="route-point">{t.source}</span>
                <span className="route-line" />
                <span className="route-point">{t.destination}</span>
              </div>
              <div className="trip-meta">
                <span>Vehicle <b>{t.vehicle?.name} · {t.vehicle?.registrationNumber}</b></span>
                <span>Driver <b>{t.driver?.name}</b></span>
                <span>Cargo <b>{t.cargoWeightKg.toLocaleString()} kg</b></span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
