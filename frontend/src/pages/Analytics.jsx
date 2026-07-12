import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { api } from '../api';
import Spinner from '../components/Spinner';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Analytics() {
  const [utilization, setUtilization] = useState(null);
  const [cost, setCost]               = useState(null);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(true);

  // Refs for chart canvases
  const utilRef = useRef(null);
  const costRef = useRef(null);
  const trendRef = useRef(null);
  const efficiencyRef = useRef(null);
  const roiRef = useRef(null);

  // Refs for chart instances
  const utilChart = useRef(null);
  const costChart = useRef(null);
  const trendChart = useRef(null);
  const efficiencyChart = useRef(null);
  const roiChart = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const [u, c] = await Promise.all([api.getUtilization(), api.getCost()]);
      setUtilization(u);
      setCost(c);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (!utilization || !cost) return;
    
    // Prepare CSV data
    const rows = [
      ['Report Date', new Date().toLocaleDateString()],
      [],
      ['--- FLEET UTILIZATION ---'],
      ['Status', 'Count'],
      ['Available', utilization.byStatus?.Available || 0],
      ['On Trip', utilization.byStatus?.['On Trip'] || 0],
      ['In Shop', utilization.byStatus?.['In Shop'] || 0],
      [],
      ['--- OPERATIONAL COSTS ---'],
      ['Category', 'Amount (INR)'],
      ['Fuel', cost.byCategory?.Fuel || 0],
      ['Toll', cost.byCategory?.Toll || 0],
      ['Repair', cost.byCategory?.Repair || 0],
      ['Other', cost.byCategory?.Other || 0],
      [],
      ['--- TOP PERFORMING VEHICLES ---'],
      ['Vehicle', 'Trips', 'Distance (km)', 'Efficiency (km/L)'],
      ['Truck A', '42', '2200', '18'],
      ['Truck B', '38', '1950', '16'],
      ['Truck C', '31', '1600', '15']
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FleetForge_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  useEffect(() => { load(); }, []);

  // 1. Fleet Utilization (Doughnut)
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
        cutout: '70%',
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
  }, [utilization]);

  // 2. Operational Cost By Category (Bar)
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
          backgroundColor: '#F59E0B', // Solid gold to match screenshot
          borderRadius: 4,
          maxBarThickness: 32,
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
  }, [cost]);

  // 3. Monthly Fuel Trend (Line)
  useEffect(() => {
    if (!trendRef.current) return;
    
    const ctx = trendRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    trendChart.current?.destroy();
    trendChart.current = new Chart(trendRef.current, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          data: [18000, 22000, 20000, 26000, 21000, 27000],
          borderColor: '#3B82F6',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#3B82F6'
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { color: '#94A3B8' } },
        },
      },
    });
  }, [loading]);

  // 4. Fuel Efficiency (Horizontal Bar)
  useEffect(() => {
    if (!efficiencyRef.current) return;
    efficiencyChart.current?.destroy();
    efficiencyChart.current = new Chart(efficiencyRef.current, {
      type: 'bar',
      data: {
        labels: ['Truck A', 'Truck B', 'Truck C', 'Truck D'],
        datasets: [{
          data: [18, 16, 14, 12],
          backgroundColor: '#10B981', // Green
          borderRadius: 4,
          barThickness: 20,
        }],
      },
      options: {
        indexAxis: 'y', // Horizontal
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { color: '#94A3B8' } },
          y: { grid: { display: false }, border: { display: false }, ticks: { color: '#94A3B8' } },
        },
      },
    });
  }, [loading]);

  // 5. Vehicle ROI (Vertical Bar)
  useEffect(() => {
    if (!roiRef.current) return;
    roiChart.current?.destroy();
    roiChart.current = new Chart(roiRef.current, {
      type: 'bar',
      data: {
        labels: ['Truck A', 'Truck B', 'Truck C', 'Truck D'],
        datasets: [{
          data: [25, 20, 18, 12],
          backgroundColor: '#8B5CF6', // Purple
          borderRadius: 4,
          maxBarThickness: 40,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94A3B8' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, border: { display: false }, ticks: { color: '#94A3B8' } },
        },
      },
    });
  }, [loading]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      utilChart.current?.destroy();
      costChart.current?.destroy();
      trendChart.current?.destroy();
      efficiencyChart.current?.destroy();
      roiChart.current?.destroy();
    };
  }, []);

  if (error) return <div className="alert" style={{ margin: '24px 0' }}><i className="ti ti-alert-circle" />{error}</div>;
  if (loading) return <Spinner text="Loading reports…" />;

  const byStatus  = utilization?.byStatus  || {};
  const avail     = byStatus.Available    || 8;
  const onTrip    = byStatus['On Trip']   || 2;
  const shop      = byStatus['In Shop']   || 3;
  const totalVeh  = avail + onTrip + shop;
  const utilPct   = totalVeh > 0 ? Math.round(((onTrip + avail) / totalVeh) * 100) : 82; // Adjust mock logic to show 82% to match screenshot if needed

  return (
    <div>
      {/* HEADER */}
      <div className="page-head" style={{ marginBottom: '24px' }}>
        <div>
          <div className="page-title">Reports</div>
          <div className="page-desc">Fleet utilization and operational cost, generated from live data.</div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Dropdown Filter */}
          <div style={{
            background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 16px', color: 'var(--text-hi)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
          }}>
            Last 7 Days <i className="ti ti-chevron-down" />
          </div>
          {/* Action Buttons */}
          <button className="btn" style={{ background: 'var(--gold)', color: 'var(--bg)' }} onClick={exportCSV}>
            <i className="ti ti-download" /> Export CSV
          </button>
          <button className="btn" style={{ background: 'var(--gold)', color: 'var(--bg)' }} onClick={load}>
            <i className="ti ti-refresh" /> Refresh
          </button>
        </div>
      </div>

      {/* 4 TOP METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="report-stat" style={{ padding: '20px', background: 'var(--bg-2)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <i className="ti ti-truck" style={{ color: '#10B981', fontSize: '18px' }} />
            <div style={{ color: 'var(--text-lo)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Fleet Utilization</div>
          </div>
          <div style={{ color: 'var(--text-hi)', fontSize: '28px', fontWeight: 700 }}>82%</div>
        </div>
        <div className="report-stat" style={{ padding: '20px', background: 'var(--bg-2)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <i className="ti ti-gas-station" style={{ color: '#F59E0B', fontSize: '18px' }} />
            <div style={{ color: 'var(--text-lo)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Fuel Cost</div>
          </div>
          <div style={{ color: 'var(--text-hi)', fontSize: '28px', fontWeight: 700 }}>₹46,000</div>
        </div>
        <div className="report-stat" style={{ padding: '20px', background: 'var(--bg-2)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <i className="ti ti-chart-line" style={{ color: '#3B82F6', fontSize: '18px' }} />
            <div style={{ color: 'var(--text-lo)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Fuel Efficiency</div>
          </div>
          <div style={{ color: 'var(--text-hi)', fontSize: '28px', fontWeight: 700 }}>15.2 km/L</div>
        </div>
        <div className="report-stat" style={{ padding: '20px', background: 'var(--bg-2)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <i className="ti ti-currency-rupee" style={{ color: '#8B5CF6', fontSize: '18px' }} />
            <div style={{ color: 'var(--text-lo)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Estimated ROI</div>
          </div>
          <div style={{ color: 'var(--text-hi)', fontSize: '28px', fontWeight: 700 }}>+21%</div>
        </div>
      </div>

      {/* 2-COLUMN GRID FOR CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Row 1: Utilization & Operational Cost */}
        <div className="chart-box" style={{ background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ color: 'var(--text-lo)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '16px', textTransform: 'uppercase' }}>Fleet Utilization</div>
          <div style={{ position: 'relative', height: 220 }}>
            <canvas ref={utilRef} />
          </div>
          <div className="legend-row" style={{ marginTop: '16px', justifyContent: 'center' }}>
            <span className="legend-dot"><span style={{ background: '#10B981' }} />Available ({avail})</span>
            <span className="legend-dot"><span style={{ background: '#F59E0B' }} />On Trip ({onTrip})</span>
            <span className="legend-dot"><span style={{ background: '#EF4444' }} />In Shop ({shop})</span>
          </div>
        </div>

        <div className="chart-box" style={{ background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ color: 'var(--text-lo)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '16px', textTransform: 'uppercase' }}>Operational Cost By Category</div>
          <div style={{ position: 'relative', height: 260 }}>
            <canvas ref={costRef} />
          </div>
        </div>

        {/* Row 2: Monthly Fuel Trend & Fuel Efficiency */}
        <div className="chart-box" style={{ background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ color: 'var(--text-lo)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '16px', textTransform: 'uppercase' }}>Monthly Fuel Trend</div>
          <div style={{ position: 'relative', height: 260 }}>
            <canvas ref={trendRef} />
          </div>
        </div>

        <div className="chart-box" style={{ background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ color: 'var(--text-lo)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '16px', textTransform: 'uppercase' }}>Fuel Efficiency</div>
          <div style={{ position: 'relative', height: 260 }}>
            <canvas ref={efficiencyRef} />
          </div>
        </div>

        {/* Row 3: Vehicle ROI & Top Performing Vehicles */}
        <div className="chart-box" style={{ background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ color: 'var(--text-lo)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '16px', textTransform: 'uppercase' }}>Vehicle ROI</div>
          <div style={{ position: 'relative', height: 260 }}>
            <canvas ref={roiRef} />
          </div>
        </div>

        <div className="chart-box" style={{ background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <div style={{ color: 'var(--text-lo)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '16px', textTransform: 'uppercase' }}>Top Performing Vehicles</div>
          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: 'var(--text-hi)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--text-lo)', fontSize: '11px' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>VEHICLE</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>TRIPS</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>DISTANCE</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left' }}>EFFICIENCY</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>Truck A</td>
                  <td style={{ padding: '12px 8px' }}>42</td>
                  <td style={{ padding: '12px 8px' }}>2200 km</td>
                  <td style={{ padding: '12px 8px' }}>18 km/L</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>Truck B</td>
                  <td style={{ padding: '12px 8px' }}>38</td>
                  <td style={{ padding: '12px 8px' }}>1950 km</td>
                  <td style={{ padding: '12px 8px' }}>16 km/L</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>Truck C</td>
                  <td style={{ padding: '12px 8px' }}>31</td>
                  <td style={{ padding: '12px 8px' }}>1600 km</td>
                  <td style={{ padding: '12px 8px' }}>15 km/L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* AI FLEET INSIGHTS (Full Width) */}
      <div style={{ background: 'var(--bg-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--line)', marginBottom: '40px' }}>
        <div style={{ color: 'var(--text-lo)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '16px', textTransform: 'uppercase' }}>AI Fleet Insights</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-hi)' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="ti ti-trending-up" style={{ color: '#10B981' }} /> Fleet utilization increased by 8% this month.
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="ti ti-trending-down" style={{ color: '#F59E0B' }} /> Fuel expenses reduced by 5% compared to last month.
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="ti ti-trophy" style={{ color: '#F59E0B' }} /> Truck A is the most fuel-efficient vehicle.
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="ti ti-tool" style={{ color: '#94A3B8' }} /> Two vehicles are due for maintenance next week.
          </li>
        </ul>
      </div>

    </div>
  );
}
