import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import Spinner from '../components/Spinner';
import Badge from '../components/Badge';
import TripStepper from '../components/TripStepper';

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTrip() {
      try {
        const [t, exps] = await Promise.all([
          api.getTrip(id),
          api.getExpenses(id)
        ]);
        setTrip(t);
        setExpenses(exps);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [id]);

  if (loading) return <Spinner text="Loading Trip Details..." />;
  if (error) return <div className="alert"><i className="ti ti-alert-circle" />{error}</div>;
  if (!trip) return <div className="empty">Trip not found</div>;

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="page-head" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/trips" className="btn btn-sm btn-ghost" style={{ padding: '4px 8px' }}>
              <i className="ti ti-arrow-left" />
            </Link>
            Trip {trip._id.slice(-6).toUpperCase()}
          </div>
          <div className="page-desc">Created {new Date(trip.createdAt).toLocaleString()}</div>
        </div>
        <Badge status={trip.status} />
      </div>

      {/* Main Stepper Panel */}
      <div className="panel" style={{ marginBottom: 24, padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', margin: '8px 0 24px', fontSize: 24, fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
          <span style={{ color: 'var(--text-hi)' }}>{trip.source}</span>
          <i className="ti ti-arrow-right" style={{ color: 'var(--gold)', fontSize: 20 }} />
          <span style={{ color: 'var(--text-hi)' }}>{trip.destination}</span>
        </div>
        <TripStepper status={trip.status} />
        {trip.eta && trip.status === 'Dispatched' && (
          <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-lo)', fontSize: 14 }}>
            Estimated Arrival: <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>{new Date(trip.eta).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Vehicle Panel */}
        <div className="panel" style={{ padding: 24 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 16 }}>
            <i className="ti ti-truck" style={{ color: 'var(--cyan)' }} /> Vehicle Specs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-lo)' }}>Name</span>
              <span style={{ fontWeight: 600 }}>{trip.vehicle?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-lo)' }}>Registration</span>
              <span style={{ fontWeight: 600, color: 'var(--gold)' }} className="mono">{trip.vehicle?.registrationNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-lo)' }}>Type</span>
              <span style={{ fontWeight: 600 }}>{trip.vehicle?.type}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-lo)' }}>Cargo Load</span>
              <span style={{ fontWeight: 600 }}>
                {trip.cargoWeightKg.toLocaleString()} / {trip.vehicle?.loadCapacityKg.toLocaleString()} kg
              </span>
            </div>
          </div>
        </div>

        {/* Driver Panel */}
        <div className="panel" style={{ padding: 24 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 16 }}>
            <i className="ti ti-user" style={{ color: 'var(--cyan)' }} /> Assigned Driver
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-lo)' }}>Name</span>
              <span style={{ fontWeight: 600 }}>{trip.driver?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-lo)' }}>License No.</span>
              <span style={{ fontWeight: 600 }} className="mono">{trip.driver?.licenseNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-lo)' }}>Phone</span>
              <span style={{ fontWeight: 600 }}>{trip.driver?.phone || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-lo)' }}>License Expiry</span>
              <span style={{ fontWeight: 600, color: new Date(trip.driver?.licenseExpiry) < new Date() ? 'var(--red)' : 'var(--text-hi)' }}>
                {new Date(trip.driver?.licenseExpiry).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Ledger */}
      <div className="panel">
        <div className="panel-head">
          <h3><i className="ti ti-receipt" style={{ marginRight: 8, color: 'var(--cyan)' }} /> Trip Expenses Ledger</h3>
          <span style={{ background: 'var(--gold-bg-hi)', color: 'var(--gold)', padding: '4px 12px', borderRadius: 100, fontWeight: 700 }}>
            Total: ₹{totalExpense.toLocaleString()}
          </span>
        </div>
        {expenses.length === 0 ? (
          <div className="empty" style={{ padding: 40 }}>
            <i className="ti ti-receipt-off" />
            No expenses logged for this trip yet.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp._id}>
                  <td>{new Date(exp.date).toLocaleDateString()}</td>
                  <td><Badge status={exp.category} /></td>
                  <td>{exp.description}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{exp.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
