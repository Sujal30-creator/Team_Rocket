import { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';

export default function Maintenance() {
  const [vehicles, setVehicles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [v, l] = await Promise.all([api.getVehicles(), api.getMaintenance()]);
      setVehicles(v);
      setLogs(l);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function sendToShop(vehicleId) {
    setBusyId(vehicleId);
    setError('');
    try {
      await api.startMaintenance({ vehicleId, description: 'Scheduled service' });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function returnFromShop(vehicleId) {
    const log = logs.find((l) => l.vehicle?._id === vehicleId && l.status === 'In Shop');
    if (!log) return;
    setBusyId(vehicleId);
    setError('');
    try {
      await api.completeMaintenance(log._id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Maintenance</div>
          <div className="page-desc">Vehicles in the shop are hidden from trip dispatch until returned to service.</div>
        </div>
      </div>

      {error && <div className="alert" style={{ margin: '0 0 16px' }}>{error}</div>}

      <div className="panel">
        <div className="panel-head"><h3>Fleet status</h3></div>
        {loading ? (
          <div className="spinner-text">Loading…</div>
        ) : (
          <table>
            <thead>
              <tr><th>Vehicle</th><th>Registration</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id}>
                  <td>{v.name}</td>
                  <td className="mono">{v.registrationNumber}</td>
                  <td><Badge status={v.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    {v.status === 'In Shop' ? (
                      <button className="btn btn-sm" disabled={busyId === v._id} onClick={() => returnFromShop(v._id)}>
                        <i className="ti ti-check"></i>Mark serviced
                      </button>
                    ) : v.status === 'Available' ? (
                      <button className="btn btn-sm" disabled={busyId === v._id} onClick={() => sendToShop(v._id)}>
                        <i className="ti ti-tool"></i>Send for service
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-lo)' }}>Vehicle is on trip</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
