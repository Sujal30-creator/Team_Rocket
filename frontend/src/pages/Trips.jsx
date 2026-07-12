import { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';

const empty = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '' };

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [t, v, d] = await Promise.all([api.getTrips(), api.getVehicles('Available'), api.getDrivers('Available')]);
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
      setForm(empty);
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

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Trip management</div>
          <div className="page-desc">Dispatch trips, then complete or cancel to release the vehicle and driver.</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Create a trip</h3></div>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={handleDispatch}>
          <div className="form-grid">
            <div className="field"><label>Source</label>
              <input value={form.source} onChange={(e) => set('source', e.target.value)} placeholder="Mumbai" />
            </div>
            <div className="field"><label>Destination</label>
              <input value={form.destination} onChange={(e) => set('destination', e.target.value)} placeholder="Pune" />
            </div>
            <div className="field"><label>Vehicle</label>
              <select value={form.vehicleId} onChange={(e) => set('vehicleId', e.target.value)}>
                <option value="">Select available vehicle</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>{v.name} · {v.registrationNumber} ({v.loadCapacityKg.toLocaleString()} kg)</option>
                ))}
              </select>
            </div>
            <div className="field"><label>Driver</label>
              <select value={form.driverId} onChange={(e) => set('driverId', e.target.value)}>
                <option value="">Select available driver</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="field"><label>Cargo weight (kg)</label>
              <input type="number" value={form.cargoWeightKg} onChange={(e) => set('cargoWeightKg', e.target.value)} placeholder="450" />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              <i className="ti ti-send"></i>{saving ? 'Dispatching…' : 'Dispatch trip'}
            </button>
            {vehicles.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-lo)' }}>No vehicles are currently available — check the Maintenance tab.</span>}
          </div>
        </form>
      </div>

      <div className="page-head" style={{ marginBottom: 12 }}>
        <div className="page-title" style={{ fontSize: 15 }}>All trips ({trips.length})</div>
      </div>

      {loading ? (
        <div className="spinner-text">Loading…</div>
      ) : trips.length === 0 ? (
        <div className="panel"><div className="empty">No trips yet.</div></div>
      ) : (
        trips.map((t) => (
          <div className="trip-card" key={t._id}>
            <div className="trip-top">
              <span className="trip-id">TRIP-{t._id.slice(-6).toUpperCase()} · {new Date(t.createdAt).toISOString().slice(0, 10)}</span>
              <Badge status={t.status} />
            </div>
            <div className="route">
              <span className="route-point">{t.source}</span>
              <span className="route-line">{t.status === 'Running' && <span className="truck">🚚</span>}</span>
              <span className="route-point">{t.destination}</span>
            </div>
            <div className="trip-meta">
              <span>Vehicle <b>{t.vehicle?.name} · {t.vehicle?.registrationNumber}</b></span>
              <span>Driver <b>{t.driver?.name}</b></span>
              <span>Cargo <b>{t.cargoWeightKg.toLocaleString()} kg</b></span>
            </div>
            {t.status === 'Running' && (
              <div className="trip-actions">
                <button className="btn btn-sm" onClick={() => finish(t._id, 'Completed')}><i className="ti ti-check"></i>Complete trip</button>
                <button className="btn btn-sm btn-danger" onClick={() => finish(t._id, 'Cancelled')}><i className="ti ti-x"></i>Cancel trip</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
