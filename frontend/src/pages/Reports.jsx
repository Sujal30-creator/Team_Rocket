import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { api } from '../api';
import Spinner from '../components/Spinner';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Reports() {
  const [utilization, setUtilization] = useState(null);
  const [cost, setCost]               = useState(null);
  const [error, setError]             = useState('');
  const utilRef   = useRef(null);
  const costRef   = useRef(null);
  const utilChart = useRef(null);
  const costChart = useRef(null);

  async function load() {
    try {
      const [u, c] = await Promise.all([api.getUtilization(), api.getCost()]);
      setUtilization(u);
      setCost(c);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  // Utilization doughnut chart
  useEffect(() => {
    if (!utilization || !utilRef.current) return;
    const byStatus = utilization.byStatus || {};
    const avail  = byStatus.Available  || 0;
    const onTrip = byStatus['On Trip'] || 0;
    const shop   = byStatus['In Shop'] || 0;

    utilChart.current?.destroy();
    utilChart.current = new Chart(utilRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Available', 'On Trip', 'In Shop'],
        datasets: [{
          data: [avail, onTrip, shop],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        animation: { animateRotate: true, duration: 1000 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#161E2E',
            borderColor: 'rgba(99,120,160,0.25)',
            borderWidth: 1,
            titleColor: '#F1F5F9',
            bodyColor: '#94A3B8',
            padding: 12,
          },
        },
      },
    });
    return () => utilChart.current?.destroy();
  }, [utilization]);

  // Cost bar chart
  useEffect(() => {
    if (!cost || !costRef.current) return;
    const byCat = cost.byCategory || {};
    const cats  = ['Fuel', 'Toll', 'Repair', 'Other'];
    const data  = cats.map((k) => byCat[k] || 0);

    costChart.current?.destroy();
    costChart.current = new Chart(costRef.current, {
      type: 'bar',
      data: {
        labels: cats,
        datasets: [{
          data,
          backgroundColor: [
            'rgba(245,158,11,0.8)',
            'rgba(59,130,246,0.8)',
            'rgba(239,68,68,0.8)',
            'rgba(129,140,248,0.8)',
          ],
          borderRadius: 6,
          maxBarThickness: 48,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#161E2E',
            borderColor: 'rgba(99,120,160,0.25)',
            borderWidth: 1,
            titleColor: '#F1F5F9',
            bodyColor: '#94A3B8',
            padding: 12,
            callbacks: { label: (ctx) => ' ' + fmtINR(ctx.parsed.y) },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#94A3B8', font: { size: 12 } },
          },
          y: {
            grid: { color: 'rgba(99,120,160,0.1)', drawBorder: false },
            border: { display: false },
            ticks: {
              color: '#94A3B8',
              font: { size: 11 },
              callback: (v) => v === 0 ? '₹0' : '₹' + (v / 1000).toFixed(0) + 'k',
            },
          },
        },
      },
    });
    return () => costChart.current?.destroy();
  }, [cost]);

  if (error)                    return <div className="alert" style={{ margin: '24px 0' }}><i className="ti ti-alert-circle" />{error}</div>;
  if (!utilization || !cost)    return <Spinner text="Loading reports…" />;

  const byStatus  = utilization.byStatus  || {};
  const byCat     = cost.byCategory       || {};
  const avail     = byStatus.Available    || 0;
  const onTrip    = byStatus['On Trip']   || 0;
  const shop      = byStatus['In Shop']   || 0;
  const totalVeh  = avail + onTrip + shop;
  const utilPct   = totalVeh > 0 ? Math.round((onTrip / totalVeh) * 100) : 0;
  const totalCost = Object.values(byCat).reduce((s, v) => s + v, 0);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-desc">Fleet utilization and operational cost, generated from live data.</div>
        </div>
        <button className="btn" onClick={load} id="reports-refresh-btn">
          <i className="ti ti-refresh" />Refresh
        </button>
      </div>

      {/* Summary stat cards */}
      <div className="report-stats">
        <div className="report-stat">
          <div className="report-stat-label">Fleet Utilization</div>
          <div className="report-stat-value" style={{ color: utilPct >= 60 ? 'var(--green)' : utilPct >= 30 ? 'var(--amber)' : 'var(--text-hi)' }}>
            {utilPct}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 4 }}>{onTrip} of {totalVeh} vehicles on trip</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-label">Total Operational Cost</div>
          <div className="report-stat-value" style={{ color: 'var(--amber)' }}>{fmtINR(totalCost)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 4 }}>All categories combined</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-label">Top Expense</div>
          <div className="report-stat-value" style={{ color: 'var(--violet)', fontSize: 16 }}>
            {Object.entries(byCat).sort(([, a], [, b]) => b - a)[0]?.[0] || '—'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 4 }}>
            {fmtINR(Object.entries(byCat).sort(([, a], [, b]) => b - a)[0]?.[1] || 0)} spent
          </div>
        </div>
      </div>

      <div className="charts-row">
        {/* Utilization doughnut */}
        <div className="chart-box">
          <div className="chart-title">Fleet Utilization</div>
          <div style={{ position: 'relative', height: 220 }}>
            <canvas ref={utilRef} role="img" aria-label="Donut chart of fleet utilization by vehicle status" />
          </div>
          <div className="legend-row">
            <span className="legend-dot"><span style={{ background: '#10B981' }} />Available ({avail})</span>
            <span className="legend-dot"><span style={{ background: '#F59E0B' }} />On Trip ({onTrip})</span>
            <span className="legend-dot"><span style={{ background: '#EF4444' }} />In Shop ({shop})</span>
          </div>
        </div>

        {/* Cost bar chart */}
        <div className="chart-box">
          <div className="chart-title">Operational Cost by Category</div>
          <div style={{ position: 'relative', height: 220 }}>
            <canvas ref={costRef} role="img" aria-label="Bar chart of expenses by category" />
          </div>
          <div className="legend-row">
            {['Fuel', 'Toll', 'Repair', 'Other'].map((cat) => (
              <span className="legend-dot" key={cat}>
                <span style={{ background: { Fuel: '#F59E0B', Toll: '#3B82F6', Repair: '#EF4444', Other: '#818CF8' }[cat] }} />
                {cat} {byCat[cat] ? fmtINR(byCat[cat]) : '—'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
