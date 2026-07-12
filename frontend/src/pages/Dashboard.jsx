import { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import AnimatedNumber from '../components/AnimatedNumber';

const KPI_CONFIG = [
  { key: 'activeVehicles',      label: 'Active Vehicles',   icon: 'ti-truck',        iconColor: 'gold',   valColor: '' },
  { key: 'availableVehicles',   label: 'Available',         icon: 'ti-circle-check', iconColor: 'green',  valColor: 'c-green' },
  { key: 'driversOnDuty',       label: 'Drivers on Duty',   icon: 'ti-id-badge-2',   iconColor: 'white',  valColor: '' },
  { key: 'tripsRunning',        label: 'Running Trips',     icon: 'ti-route',        iconColor: 'gold',   valColor: 'c-gold' },
  { key: 'vehiclesInShop',      label: 'In Maintenance',    icon: 'ti-tool',         iconColor: 'red',    valColor: 'c-red' },
  { key: 'fleetUtilizationPct', label: 'Utilization',       icon: 'ti-chart-pie',    iconColor: 'orange', valColor: 'c-orange', suffix: '%' },
];

const VIEWS = [
  { key: 'overview',  label: 'Overview', icon: 'ti-layout-dashboard' },
  { key: 'live',      label: 'Live',     icon: 'ti-radio' },
  { key: 'compact',   label: 'Compact',  icon: 'ti-list' },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [running, setRunning] = useState([]);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState('overview');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [s, trips] = await Promise.all([api.getDashboard(), api.getTrips('Running')]);
      setSummary(s);
      setRunning(trips);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner text="Loading dashboard…" />;
  if (error)   return <div className="alert" style={{ margin: '24px 0' }}><i className="ti ti-alert-circle" />{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="page-head">
        <div className="page-head-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="page-title">Fleet <span>Dashboard</span></div>
            {running.length > 0 && (
              <div className="live-badge">
                <div className="live-dot" />
                {running.length} Live
              </div>
            )}
          </div>
          <div className="page-desc">Real-time snapshot of your entire fleet operation.</div>
        </div>
        <div className="page-head-right">
          {/* View toggle */}
          <div className="toggle-group">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                className={`toggle-btn ${view === v.key ? 'active' : ''}`}
                onClick={() => setView(v.key)}
                id={`view-${v.key}`}
              >
                <i className={`ti ${v.icon}`} />
                {v.label}
              </button>
            ))}
          </div>
          <button className="btn" onClick={load} id="dashboard-refresh-btn">
            <i className="ti ti-refresh" />Refresh
          </button>
        </div>
      </div>

      {/* ── OVERVIEW view ── */}
      {view === 'overview' && (
        <>
          {/* KPI grid */}
          <div className="kpi-grid">
            {KPI_CONFIG.map(({ key, label, icon, iconColor, valColor, suffix = '' }) => (
              <div className="kpi-card" key={key}>
                <div className={`kpi-icon ${iconColor}`}>
                  <i className={`ti ${icon}`} />
                </div>
                <div className="kpi-label">{label}</div>
                <div className={`kpi-value ${valColor}`}>
                  <AnimatedNumber value={summary[key]} />
                  {suffix && <span style={{ fontSize: 20 }}>{suffix}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Running trips panel */}
          <div className="panel panel-gold">
            <div className="panel-head">
              <h3>
                <i className="ti ti-route" style={{ color: 'var(--gold)' }} />
                Trips in Progress
                {running.length > 0 && (
                  <span style={{ marginLeft: 6, fontSize: 11.5, background: 'var(--gold-bg-hi)', color: 'var(--gold)', padding: '2px 8px', borderRadius: 100, border: '1px solid rgba(245,197,24,0.3)' }}>
                    {running.length}
                  </span>
                )}
              </h3>
              <button className="btn btn-sm btn-ghost" onClick={() => setView('live')}>
                View all <i className="ti ti-arrow-right" />
              </button>
            </div>
            {running.length === 0 ? (
              <div className="empty">
                <i className="ti ti-route-off" />
                No trips currently running. Go to Trips to dispatch.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {running.map((t, i) => (
                    <tr key={t._id} style={{ animationDelay: `${i * 60}ms` }}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{t.source}</span>
                        <i className="ti ti-arrow-right" style={{ margin: '0 6px', color: 'var(--gold)', fontSize: 12 }} />
                        <span style={{ fontWeight: 600 }}>{t.destination}</span>
                      </td>
                      <td className="mono">{t.vehicle?.name} · {t.vehicle?.registrationNumber}</td>
                      <td>{t.driver?.name}</td>
                      <td><Badge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── LIVE view ── */}
      {view === 'live' && (
        <>
          <div style={{ marginBottom: 20 }}>
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="live-dot" />
              Live Trip Tracker — {running.length} active
            </div>
          </div>
          {running.length === 0 ? (
            <div className="panel">
              <div className="empty">
                <i className="ti ti-route-off" />
                No trips currently running.
              </div>
            </div>
          ) : (
            running.map((t, i) => (
              <div className={`trip-card running`} key={t._id} style={{ animationDelay: `${i * 70}ms` }}>
                <div className="trip-top">
                  <span className="trip-id">TRIP-{t._id.slice(-6).toUpperCase()} · {new Date(t.createdAt).toISOString().slice(0, 10)}</span>
                  <Badge status={t.status} />
                </div>
                <div className="route">
                  <span className="route-point">{t.source}</span>
                  <span className="route-line active"><span className="route-truck">🚛</span></span>
                  <span className="route-point">{t.destination}</span>
                </div>
                <div className="trip-meta">
                  <span><i className="ti ti-truck" style={{ color: 'var(--text-lo)', marginRight: 4 }} />Vehicle <b>{t.vehicle?.name} · {t.vehicle?.registrationNumber}</b></span>
                  <span><i className="ti ti-user" style={{ color: 'var(--text-lo)', marginRight: 4 }} />Driver <b>{t.driver?.name}</b></span>
                  <span><i className="ti ti-package" style={{ color: 'var(--text-lo)', marginRight: 4 }} />Cargo <b>{t.cargoWeightKg?.toLocaleString()} kg</b></span>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ── COMPACT view ── */}
      {view === 'compact' && (
        <>
          {/* Inline KPI row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            {KPI_CONFIG.map(({ key, label, valColor, suffix = '' }) => (
              <div key={key} style={{ background: 'var(--bg-glass)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '10px 18px', display: 'flex', alignItems: 'baseline', gap: 8, backdropFilter: 'blur(12px)' }}>
                <span className={`kpi-value ${valColor}`} style={{ fontSize: 20 }}>
                  {summary[key]}{suffix}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Compact trips table */}
          <div className="panel">
            <div className="panel-head">
              <h3><i className="ti ti-route" style={{ color: 'var(--gold)' }} />All Running Trips</h3>
            </div>
            {running.length === 0 ? (
              <div className="empty"><i className="ti ti-route-off" />No trips running.</div>
            ) : (
              <table>
                <thead>
                  <tr><th>Trip ID</th><th>Route</th><th>Vehicle</th><th>Driver</th><th>Cargo</th></tr>
                </thead>
                <tbody>
                  {running.map((t) => (
                    <tr key={t._id}>
                      <td className="mono">TRIP-{t._id.slice(-6).toUpperCase()}</td>
                      <td><b>{t.source}</b> → <b>{t.destination}</b></td>
                      <td className="mono">{t.vehicle?.registrationNumber}</td>
                      <td>{t.driver?.name}</td>
                      <td>{t.cargoWeightKg?.toLocaleString()} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
