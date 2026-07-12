import { useEffect, useState } from 'react';
import { api } from '../api';
import Spinner from '../components/Spinner';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN');

const CAT_META = {
  Fuel:   { icon: 'ti-droplet',        cls: 'cat-fuel'   },
  Toll:   { icon: 'ti-road',           cls: 'cat-toll'   },
  Repair: { icon: 'ti-settings',       cls: 'cat-repair' },
  Other:  { icon: 'ti-dots-circle-horizontal', cls: 'cat-other' },
};

export default function Fuel() {
  const [trips, setTrips]       = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm]         = useState({ trip: '', category: 'Fuel', amount: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [t, e] = await Promise.all([api.getTrips(), api.getExpenses()]);
      setTrips(t.filter((x) => x.status === 'Running' || x.status === 'Completed'));
      setExpenses(e);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!form.trip || !form.amount) {
      setError('Select a trip and enter an amount.');
      return;
    }
    setSaving(true);
    try {
      await api.createExpense({ ...form, amount: Number(form.amount) });
      setForm({ trip: '', category: 'Fuel', amount: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Totals by category
  const totals = expenses.reduce((acc, ex) => {
    acc[ex.category] = (acc[ex.category] || 0) + ex.amount;
    return acc;
  }, {});
  const grandTotal = expenses.reduce((s, ex) => s + ex.amount, 0);

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Fuel &amp; Expenses</div>
          <div className="page-desc">Log costs against a trip; totals roll up automatically.</div>
        </div>
        <button className="btn btn-primary" id="log-expense-btn" onClick={() => setShowForm((v) => !v)}>
          <i className={`ti ${showForm ? 'ti-x' : 'ti-plus'}`} />
          {showForm ? 'Cancel' : 'Log expense'}
        </button>
      </div>

      {/* Summary stats */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <h3><i className="ti ti-chart-pie" style={{ marginRight: 8, color: 'var(--cyan)' }} />Expense Summary</h3>
        </div>
        <div className="expense-summary" style={{ paddingBottom: 20 }}>
          <div className="expense-stat">
            <div className="expense-stat-label">Total Spent</div>
            <div className="expense-stat-value" style={{ color: 'var(--cyan)' }}>{fmtINR(grandTotal)}</div>
          </div>
          {['Fuel', 'Toll', 'Repair', 'Other'].map((cat) => (
            <div className="expense-stat" key={cat}>
              <div className="expense-stat-label">{cat}</div>
              <div className="expense-stat-value">{fmtINR(totals[cat] || 0)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="panel">
          <div className="panel-head">
            <h3><i className="ti ti-plus" style={{ marginRight: 8, color: 'var(--cyan)' }} />Log an Expense</h3>
          </div>
          {error && <div className="alert"><i className="ti ti-alert-circle" />{error}</div>}
          <form onSubmit={handleAdd}>
            <div className="form-grid">
              <div className="field">
                <label>Trip</label>
                <select value={form.trip} onChange={(e) => set('trip', e.target.value)}>
                  <option value="">Select trip</option>
                  {trips.map((t) => (
                    <option key={t._id} value={t._id}>
                      TRIP-{t._id.slice(-6).toUpperCase()} · {t.source} → {t.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                  <option>Fuel</option>
                  <option>Toll</option>
                  <option>Repair</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label>Amount (₹)</label>
                <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="7000" />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={saving} id="save-expense-btn">
                <i className="ti ti-check" />{saving ? 'Saving…' : 'Log expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense log */}
      <div className="panel">
        <div className="panel-head">
          <h3>
            <i className="ti ti-receipt" style={{ marginRight: 8, color: 'var(--cyan)' }} />
            Expense Log
            <span style={{ marginLeft: 8, fontSize: 12, background: 'var(--cyan-bg)', color: 'var(--cyan)', padding: '2px 8px', borderRadius: 100, border: '1px solid rgba(34,211,238,0.2)' }}>
              {expenses.length}
            </span>
          </h3>
        </div>
        {loading ? (
          <Spinner text="Loading expenses…" />
        ) : expenses.length === 0 ? (
          <div className="empty">
            <i className="ti ti-receipt-off" />
            No expenses logged yet.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Trip</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((ex, i) => {
                const meta = CAT_META[ex.category] || CAT_META.Other;
                return (
                  <tr key={ex._id} style={{ animationDelay: `${i * 40}ms` }}>
                    <td>
                      {ex.trip
                        ? <span>{ex.trip.source} <i className="ti ti-arrow-right" style={{ color: 'var(--text-lo)', fontSize: 12 }} /> {ex.trip.destination}</span>
                        : <span style={{ color: 'var(--text-lo)' }}>—</span>}
                    </td>
                    <td>
                      <span className={`cat-icon ${meta.cls}`}>
                        <i className={`ti ${meta.icon}`} />
                        {ex.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-hi)' }}>
                      {fmtINR(ex.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
