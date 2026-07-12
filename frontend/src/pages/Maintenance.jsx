import { useEffect, useState, useMemo } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

const TYPE_ICONS = {
  Truck:   '🚛',
  Van:     '🚐',
  Trailer: '🚚',
  Tempo:   '🛺',
  SUV:     '🚙',
  Other:   '📦'
};

function statusRingClass(status) {
  if (status === 'Available') return 'available';
  if (status === 'In Shop')   return 'shop';
  if (status === 'On Trip')   return 'ontrip';
  if (status === 'Retired')   return 'offduty';
  return '';
}

function statusIcon(status) {
  if (status === 'Available') return 'ti-circle-check';
  if (status === 'In Shop')   return 'ti-tool';
  if (status === 'On Trip')   return 'ti-truck';
  if (status === 'Retired')   return 'ti-archive';
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

  // Pre-compute last maintenance for each vehicle
  const lastMaintenanceMap = useMemo(() => {
    const map = {};
    logs.filter(l => l.status === 'Completed').forEach(l => {
      const vid = l.vehicle?._id;
      if (!vid) return;
      const date = new Date(l.completedAt);
      if (!map[vid] || date > map[vid]) {
        map[vid] = date;
      }
    });
    return map;
  }, [logs]);

  const inShop    = vehicles.filter((v) => v.status === 'In Shop');
  const available = vehicles.filter((v) => v.status === 'Available');
  const onTrip    = vehicles.filter((v) => v.status === 'On Trip');
  const retired   = vehicles.filter((v) => v.status === 'Retired');

  const orderedTypes = ['Truck', 'Trailer', 'Van', 'Tempo', 'SUV', 'Other'];

  const renderVehicleGroup = (vehicleList, title, colorClass, iconName) => {
    if (vehicleList.length === 0) return null;

    // Group by type within this status
    const groupedByType = vehicleList.reduce((acc, v) => {
      if (!acc[v.type]) acc[v.type] = [];
      acc[v.type].push(v);
      return acc;
    }, {});

    return (
      <div className="panel" style={{ marginBottom: 24, padding: 24 }}>
        <div className="panel-head" style={{ borderBottom: `2px solid var(--${colorClass})`, paddingBottom: 12, marginBottom: 20 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20 }}>
            <i className={`ti ${iconName}`} style={{ color: `var(--${colorClass})` }} />
            {title}
            <span style={{ fontSize: 13, background: `var(--${colorClass}-bg-hi)`, color: `var(--${colorClass})`, padding: '2px 10px', borderRadius: 100 }}>
              {vehicleList.length}
            </span>
          </h3>
        </div>

        {orderedTypes.map(type => {
          const typeVehicles = groupedByType[type];
          if (!typeVehicles || typeVehicles.length === 0) return null;

          // Sort by last maintenance (oldest first, to prioritize them)
          typeVehicles.sort((a, b) => {
            const timeA = lastMaintenanceMap[a._id]?.getTime() || 0;
            const timeB = lastMaintenanceMap[b._id]?.getTime() || 0;
            return timeA - timeB; // Ascending
          });

          return (
            <div key={type} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-hi)', fontWeight: 600 }}>
                <span>{TYPE_ICONS[type]}</span>
                {type}s ({typeVehicles.length})
              </div>
              
              <div className="maint-grid">
                {typeVehicles.map((v, i) => {
                  const lastMaint = lastMaintenanceMap[v._id];
                  return (
                    <div className="maint-card" key={v._id} style={{ animationDelay: `${i * 50}ms` }}>
                      <div className={`maint-status-ring ${statusRingClass(v.status)}`}>
                        <i className={`ti ${statusIcon(v.status)}`} />
                      </div>
                      <div>
                        <div className="maint-vehicle-name">{v.name}</div>
                        <div className="maint-vehicle-reg mono">{v.registrationNumber}</div>
                        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-lo)' }}>
                          <i className="ti ti-calendar" style={{ marginRight: 4 }} />
                          Last Serviced: {lastMaint ? lastMaint.toLocaleDateString() : 'Never'}
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
                            {busyId === v._id ? 'Updating…' : 'Mark Serviced'}
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
                            {busyId === v._id ? 'Updating…' : 'Send for Service'}
                          </button>
                        ) : (
                          <div style={{ fontSize: 11, color: 'var(--text-lo)', textAlign: 'center', padding: '4px 0' }}>
                            <i className="ti ti-lock" style={{ marginRight: 4 }} />
                            {v.status === 'Retired' ? 'Vehicle Retired' : 'Vehicle On Trip'}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Maintenance</div>
          <div className="page-desc">Manage fleet servicing. Vehicles sorted by most overdue for service.</div>
        </div>
      </div>

      {error && <div className="alert" style={{ margin: '0 0 16px' }}><i className="ti ti-alert-circle" />{error}</div>}

      {/* Summary stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
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
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--bg-3)' }}><i className="ti ti-archive" /></div>
          <div className="kpi-label">Retired</div>
          <div className="kpi-value" style={{ color: 'var(--text-lo)' }}>{retired.length}</div>
        </div>
      </div>

      {/* Vehicle cards segregated by Availability */}
      {loading ? (
        <Spinner text="Loading vehicles…" />
      ) : vehicles.length === 0 ? (
        <div className="empty"><i className="ti ti-truck-off" />No vehicles registered yet.</div>
      ) : (
        <>
          {renderVehicleGroup(inShop, 'Currently In Shop', 'red', 'ti-tool')}
          {renderVehicleGroup(available, 'Available for Service', 'green', 'ti-circle-check')}
          {renderVehicleGroup(onTrip, 'On Trip (Locked)', 'amber', 'ti-truck')}
          {renderVehicleGroup(retired, 'Retired Fleet', 'line', 'ti-archive')}
        </>
      )}
    </div>
  );
}
