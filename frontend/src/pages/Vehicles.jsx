import { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';

const empty = { registrationNumber: '', name: '', type: 'Truck', loadCapacityKg: '', odometerKm: '', acquisitionCost: '' };

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        name: form.name,
        type: form.type,
        loadCapacityKg: Number(form.loadCapacityKg),
        odometerKm: Number(form.odometerKm) || 0,
        acquisitionCost: Number(form.acquisitionCost) || 0,
      });
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
          <div className="page-title">Vehicle registry</div>
          <div className="page-desc">Trucks and vans in the fleet, with live availability status.</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Register a vehicle</h3></div>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={handleAdd}>
          <div className="form-grid">
            <div className="field"><label>Registration no.</label>
              <input value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value.toUpperCase())} placeholder="MH12AB1234" />
            </div>
            <div className="field"><label>Vehicle name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Truck 07" />
            </div>
            <div className="field"><label>Type</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option>Truck</option><option>Van</option><option>Trailer</option>
              </select>
            </div>
            <div className="field"><label>Load capacity (kg)</label>
              <input type="number" value={form.loadCapacityKg} onChange={(e) => set('loadCapacityKg', e.target.value)} placeholder="8000" />
            </div>
            <div className="field"><label>Odometer (km)</label>
              <input type="number" value={form.odometerKm} onChange={(e) => set('odometerKm', e.target.value)} placeholder="0" />
            </div>
            <div className="field"><label>Acquisition cost (₹)</label>
              <input type="number" value={form.acquisitionCost} onChange={(e) => set('acquisitionCost', e.target.value)} placeholder="1850000" />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              <i className="ti ti-plus"></i>{saving ? 'Saving…' : 'Register vehicle'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Fleet ({vehicles.length})</h3></div>
        {loading ? (
          <div className="spinner-text">Loading…</div>
        ) : vehicles.length === 0 ? (
          <div className="empty">No vehicles registered yet.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Registration</th><th>Name</th><th>Type</th><th>Capacity</th><th>Odometer</th><th>Status</th></tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id}>
                  <td className="mono">{v.registrationNumber}</td>
                  <td>{v.name}</td>
                  <td>{v.type}</td>
                  <td>{v.loadCapacityKg.toLocaleString()} kg</td>
                  <td>{v.odometerKm.toLocaleString()} km</td>
                  <td><Badge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
