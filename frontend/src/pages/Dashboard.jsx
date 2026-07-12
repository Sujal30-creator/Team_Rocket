import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import AnimatedNumber from '../components/AnimatedNumber';
import TripStepper from '../components/TripStepper';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

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
  { key: 'live',      label: 'Live Map', icon: 'ti-radio' },
  { key: 'vehicles',  label: 'Fleet Filter', icon: 'ti-filter' },
];

// Mock 7-day historical data for the Line Chart
const MOCK_HISTORY = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    name: d.toLocaleDateString('en-US', { weekday: 'short' }),
    Available: Math.floor(Math.random() * 5) + 3,
    'On Trip': Math.floor(Math.random() * 4) + 1,
    'In Shop': Math.floor(Math.random() * 2),
    Retired: 0,
  };
});

function formatTime(dateString) {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [running, setRunning] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState('overview');

  // Filters
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [s, tripsList, vehiclesList] = await Promise.all([
        api.getDashboard(),
        api.getTrips(), // We'll filter this client-side for active ones
        api.getVehicles() // Fetch all for the filter view
      ]);
      setSummary(s);
      setRunning(tripsList.filter(t => ['Draft', 'Dispatched', 'On Trip'].includes(t.status)));
      setAllVehicles(vehiclesList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter(v => {
      if (filterType !== 'All' && v.type !== filterType) return false;
      if (filterStatus !== 'All' && v.status !== filterStatus) return false;
      return true;
    });
  }, [allVehicles, filterType, filterStatus]);

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
                {running.length} Active
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

          {/* Line Chart Panel */}
          <div className="panel" style={{ marginBottom: 24, padding: '24px' }}>
            <div className="panel-head" style={{ marginBottom: 20 }}>
              <h3><i className="ti ti-chart-line" style={{ color: 'var(--gold)' }} /> 7-Day Fleet Availability Trend</h3>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={MOCK_HISTORY} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-2)', borderColor: 'var(--line)', borderRadius: 'var(--radius-sm)' }}
                    itemStyle={{ color: 'var(--text-hi)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Available" stroke="var(--green)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="On Trip" stroke="var(--gold)" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="In Shop" stroke="var(--red)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
                Live Map <i className="ti ti-arrow-right" />
              </button>
            </div>
            {running.length === 0 ? (
              <div className="empty">
                <i className="ti ti-route-off" />
                No trips currently active. Go to Trips to draft or dispatch.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Trip</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Status</th>
                    <th>ETA</th>
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
                      <td className="mono">{t.vehicle?.name || '--'}</td>
                      <td>{t.driver?.name || '--'}</td>
                      <td><Badge status={t.status} /></td>
                      <td className="mono" style={{ color: 'var(--cyan)' }}>
                        {t.status === 'Draft' ? '--' : formatTime(t.eta)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── LIVE MAP view ── */}
      {view === 'live' && (
        <>
          <div style={{ marginBottom: 20 }}>
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="live-dot" />
              Live Trip Tracker — {running.filter(t => ['Dispatched', 'On Trip'].includes(t.status)).length} active
            </div>
          </div>
          {running.filter(t => ['Dispatched', 'On Trip'].includes(t.status)).length === 0 ? (
            <div className="panel">
              <div className="empty">
                <i className="ti ti-route-off" />
                No trips currently dispatched or on trip.
              </div>
            </div>
          ) : (
            running.filter(t => ['Dispatched', 'On Trip'].includes(t.status)).map((t, i) => (
              <div className={`trip-card running`} key={t._id} style={{ animationDelay: `${i * 70}ms` }}>
                <div className="trip-top">
                  <Link to={`/trips/${t._id}`} className="trip-id" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
                    TRIP-{t._id.slice(-6).toUpperCase()} · ETA: <span style={{color: 'var(--cyan)'}}>{formatTime(t.eta)}</span>
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
                  <span><i className="ti ti-truck" style={{ color: 'var(--text-lo)', marginRight: 4 }} />Vehicle <b>{t.vehicle?.name}</b></span>
                  <span><i className="ti ti-user" style={{ color: 'var(--text-lo)', marginRight: 4 }} />Driver <b>{t.driver?.name}</b></span>
                  <span><i className="ti ti-package" style={{ color: 'var(--text-lo)', marginRight: 4 }} />Cargo <b>{t.cargoWeightKg?.toLocaleString()} kg</b></span>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ── FLEET FILTER view ── */}
      {view === 'vehicles' && (
        <div className="panel">
          <div className="panel-head" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 16, marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-filter" style={{ color: 'var(--gold)' }} />
              Fleet Filter
            </h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <select className="select-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="All">All Types</option>
                <option value="Truck">Trucks</option>
                <option value="Trailer">Trailers</option>
                <option value="Van">Vans</option>
                <option value="Tempo">Tempos</option>
                <option value="SUV">SUVs</option>
                <option value="Other">Other</option>
              </select>
              <select className="select-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="In Shop">In Shop</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>
          
          {filteredVehicles.length === 0 ? (
            <div className="empty">
              <i className="ti ti-filter-off" />
              No vehicles match these filters.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Reg. Number</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map(v => (
                  <tr key={v._id}>
                    <td><b>{v.name}</b></td>
                    <td className="mono">{v.registrationNumber}</td>
                    <td>{v.type}</td>
                    <td><Badge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
