import { useEffect, useState } from 'react';
import { api } from '../api';

const fmtINR = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Fuel() {
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ trip: '', category: 'Fuel', amount: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Fuel &amp; expenses</div>
          <div className="page-desc">Log costs against a trip; totals roll up automatically.</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Log an expense</h3></div>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={handleAdd}>
          <div className="form-grid">
            <div className="field"><label>Trip</label>
              <select value={form.trip} onChange={(e) => set('trip', e.target.value)}>
                <option value="">Select trip</option>
                {trips.map((t) => (
                  <option key={t._id} value={t._id}>TRIP-{t._id.slice(-6).toUpperCase()} · {t.source} → {t.destination}</option>
                ))}
              </select>
            </div>
            <div className="field"><label>Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option>Fuel</option><option>Toll</option><option>Repair</option><option>Other</option>
              </select>
            </div>
            <div className="field"><label>Amount (₹)</label>
              <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="7000" />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              <i className="ti ti-plus"></i>{saving ? 'Saving…' : 'Log expense'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Expense log ({expenses.length})</h3></div>
        {loading ? (
          <div className="spinner-text">Loading…</div>
        ) : expenses.length === 0 ? (
          <div className="empty">No expenses logged yet.</div>
        ) : (
          <table>
            <thead><tr><th>Trip</th><th>Category</th><th>Amount</th></tr></thead>
            <tbody>
              {expenses.map((ex) => (
                <tr key={ex._id}>
                  <td>{ex.trip ? `${ex.trip.source} → ${ex.trip.destination}` : '—'}</td>
                  <td>{ex.category}</td>
                  <td>{fmtINR(ex.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
