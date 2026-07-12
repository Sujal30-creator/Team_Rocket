import { useEffect, useState } from 'react';
import { api } from '../api';
import Badge from '../components/Badge';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [running, setRunning] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="spinner-text">Loading dashboard…</div>;
  if (error) return <div className="alert" style={{ margin: '24px 0' }}>{error}</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Fleet dashboard</div>
          <div className="page-desc">Live snapshot of vehicles, drivers, and trips in motion.</div>
        </div>
        <button className="btn" onClick={load}><i className="ti ti-refresh"></i>Refresh</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Active vehicles</div><div className="kpi-value">{summary.activeVehicles}</div></div>
        <div className="kpi-card"><div className="kpi-label">Available vehicles</div><div className="kpi-value teal">{summary.availableVehicles}</div></div>
        <div className="kpi-card"><div className="kpi-label">Drivers on duty</div><div className="kpi-value">{summary.driversOnDuty}</div></div>
        <div className="kpi-card"><div className="kpi-label">Trips running</div><div className="kpi-value amber">{summary.tripsRunning}</div></div>
        <div className="kpi-card"><div className="kpi-label">In maintenance</div><div className="kpi-value red">{summary.vehiclesInShop}</div></div>
        <div className="kpi-card"><div className="kpi-label">Fleet utilization</div><div className="kpi-value">{summary.fleetUtilizationPct}%</div></div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Trips in progress</h3></div>
        {running.length === 0 ? (
          <div className="empty">No trips currently running. Dispatch one from the Trips tab.</div>
        ) : (
          <table>
            <tbody>
              {running.map((t) => (
                <tr key={t._id}>
                  <td style={{ width: '30%' }}><b>{t.source} → {t.destination}</b></td>
                  <td className="mono">{t.vehicle?.name} · {t.vehicle?.registrationNumber}</td>
                  <td>{t.driver?.name}</td>
                  <td><Badge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
