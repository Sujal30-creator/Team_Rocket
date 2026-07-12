import { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

function statusRingClass(status) {
  if (status === 'Available') return 'available';
  if (status === 'In Shop')   return 'shop';
  if (status === 'On Trip')   return 'ontrip';
  return '';
}

function statusIcon(status) {
  if (status === 'Available') return 'ti-circle-check';
  if (status === 'In Shop')   return 'ti-tool';
  if (status === 'On Trip')   return 'ti-truck';
  return 'ti-circle';
}

export default function Maintenance() {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [logs, setLogs]         = useState([]);
  const [busyId, setBusyId]     = useState(null);

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

  const inShop    = vehicles.filter((v) => v.status === 'In Shop');
  const available = vehicles.filter((v) => v.status === 'Available');
  const onTrip    = vehicles.filter((v) => v.status === 'On Trip');

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Maintenance</div>
          <div className="page-desc">Vehicles in the shop are hidden from trip dispatch until returned to service.</div>
        </div>
      </div>

      {error && <div className="alert" style={{ margin: '0 0 16px' }}><i className="ti ti-alert-circle" />{error}</div>}

      {/* Summary stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-icon green"><i className="ti ti-circle-check" /></div>
          <div className="kpi-label">Available</div>
          <div className="kpi-value c-green">{available.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><i className="ti ti-tool" /></div>
          <div className="kpi-label">In Shop</div>
          <div className="kpi-value c-red">{inShop.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon amber"><i className="ti ti-truck" /></div>
          <div className="kpi-label">On Trip</div>
          <div className="kpi-value c-amber">{onTrip.length}</div>
        </div>
      </div>

      {/* Vehicle cards */}
      <div className="panel">
        <div className="panel-head">
          <h3><i className="ti ti-tool" style={{ marginRight: 8, color: 'var(--cyan)' }} />Fleet Status</h3>
        </div>
        {loading ? (
          <Spinner text="Loading vehicles…" />
        ) : vehicles.length === 0 ? (
          <div className="empty"><i className="ti ti-truck-off" />No vehicles registered yet.</div>
        ) : (
          <div className="maint-grid">
            {vehicles.map((v, i) => (
              <div className="maint-card" key={v._id} style={{ animationDelay: `${i * 50}ms` }}>
                <div className={`maint-status-ring ${statusRingClass(v.status)}`}>
                  <i className={`ti ${statusIcon(v.status)}`} />
                </div>
                <div>
                  <div className="maint-vehicle-name">{v.name}</div>
                  <div className="maint-vehicle-reg">{v.registrationNumber}</div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                    <Badge status={v.status} />
                  </div>
                </div>
                <div>
                  {v.status === 'In Shop' ? (
                    <button
                      className="btn btn-sm"
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={busyId === v._id}
                      onClick={() => returnFromShop(v._id)}
                      id={`service-done-${v._id}`}
                    >
                      <i className="ti ti-check" />
                      {busyId === v._id ? 'Updating…' : 'Mark serviced'}
                    </button>
                  ) : v.status === 'Available' ? (
                    <button
                      className="btn btn-sm"
                      style={{ width: '100%', justifyContent: 'center', color: 'var(--amber)', borderColor: 'rgba(245,158,11,0.3)' }}
                      disabled={busyId === v._id}
                      onClick={() => sendToShop(v._id)}
                      id={`send-to-shop-${v._id}`}
                    >
                      <i className="ti ti-tool" />
                      {busyId === v._id ? 'Updating…' : 'Send for service'}
                    </button>
                  ) : (
                    <div style={{ fontSize: 11, color: 'var(--text-lo)', textAlign: 'center', padding: '4px 0' }}>
                      <i className="ti ti-lock" style={{ marginRight: 4 }} />Vehicle on trip
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
