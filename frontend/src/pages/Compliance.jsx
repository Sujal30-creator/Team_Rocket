import { useState } from 'react';

export default function Compliance() {
  // Mock compliance data for the Safety Officer
  const [items] = useState([
    { id: 1, type: 'Driver License Expiry', entity: 'Arjun', due: '2026-08-15', status: 'Pending' },
    { id: 2, type: 'Vehicle Insurance', entity: 'MH-01-AB-1234', due: '2026-09-01', status: 'Compliant' },
    { id: 3, type: 'Safety Inspection', entity: 'DL-4C-AF-7777', due: '2026-07-20', status: 'Overdue' },
  ]);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Compliance</div>
          <div className="page-desc">Track safety compliance, license expirations, and insurance.</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Upcoming Renewals & Expirations</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Entity</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.type}</td>
                <td className="mono">{i.entity}</td>
                <td>{i.due}</td>
                <td>
                  <span style={{ 
                    color: i.status === 'Compliant' ? 'var(--green)' : i.status === 'Overdue' ? 'var(--red)' : 'var(--orange)',
                    fontWeight: 600,
                    fontSize: 12,
                    textTransform: 'uppercase'
                  }}>
                    {i.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
