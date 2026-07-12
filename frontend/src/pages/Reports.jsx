import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { api } from '../api';

export default function Reports() {
  const [utilization, setUtilization] = useState(null);
  const [cost, setCost] = useState(null);
  const [error, setError] = useState('');
  const utilRef = useRef(null);
  const costRef = useRef(null);
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

  useEffect(() => {
    if (!utilization || !utilRef.current) return;
    const byStatus = utilization.byStatus || {};
    const avail = byStatus.Available || 0;
    const onTrip = byStatus['On Trip'] || 0;
    const shop = byStatus['In Shop'] || 0;

    utilChart.current?.destroy();
    utilChart.current = new Chart(utilRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Available', 'On trip', 'In shop'],
        datasets: [{ data: [avail, onTrip, shop], backgroundColor: ['#3ECF8E', '#F4A93B', '#E5484D'], borderColor: '#141B24', borderWidth: 3 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
    });
    return () => utilChart.current?.destroy();
  }, [utilization]);

  useEffect(() => {
    if (!cost || !costRef.current) return;
    const byCat = cost.byCategory || {};
    costChart.current?.destroy();
    costChart.current = new Chart(costRef.current, {
      type: 'bar',
      data: {
        labels: ['Fuel', 'Toll', 'Repair', 'Other'],
        datasets: [{ data: ['Fuel', 'Toll', 'Repair', 'Other'].map((k) => byCat[k] || 0), backgroundColor: '#F4A93B', borderRadius: 4, maxBarThickness: 36 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#9AA4B2' } },
          y: { grid: { color: '#2A3441' }, ticks: { color: '#9AA4B2', callback: (v) => '₹' + v / 1000 + 'k' } },
        },
      },
    });
    return () => costChart.current?.destroy();
  }, [cost]);

  if (error) return <div className="alert" style={{ margin: '24px 0' }}>{error}</div>;
  if (!utilization || !cost) return <div className="spinner-text">Loading reports…</div>;

  const byStatus = utilization.byStatus || {};
  const avail = byStatus.Available || 0;
  const onTrip = byStatus['On Trip'] || 0;
  const shop = byStatus['In Shop'] || 0;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-desc">Fleet utilization and operational cost, generated from live data.</div>
        </div>
      </div>
      <div className="charts-row">
        <div className="chart-box">
          <h4>Fleet utilization</h4>
          <div style={{ position: 'relative', height: 220 }}>
            <canvas ref={utilRef} role="img" aria-label="Donut chart of fleet utilization by vehicle status" />
          </div>
          <div className="legend-row">
            <span className="legend-dot"><span style={{ background: '#3ECF8E' }}></span>Available {avail}</span>
            <span className="legend-dot"><span style={{ background: '#F4A93B' }}></span>On trip {onTrip}</span>
            <span className="legend-dot"><span style={{ background: '#E5484D' }}></span>In shop {shop}</span>
          </div>
        </div>
        <div className="chart-box">
          <h4>Operational cost by category</h4>
          <div style={{ position: 'relative', height: 220 }}>
            <canvas ref={costRef} role="img" aria-label="Bar chart of expenses by category" />
          </div>
        </div>
      </div>
    </div>
  );
}
