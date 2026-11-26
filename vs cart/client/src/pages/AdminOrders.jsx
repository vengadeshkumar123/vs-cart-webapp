import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';

const STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders').then(setOrders).catch((e) => setError(e.message));
  }, []);

  const changeStatus = async (id, status) => {
    try {
      const updated = await api(`/orders/${id}/status`, { method: 'PUT', body: { status } });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: updated.status } : o)));
    } catch (e) {
      setError(e.message);
    }
  };

  if (!orders && !error) return <p className="muted">Loading…</p>;

  const revenue = (orders || []).filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalPrice, 0);

  return (
    <div>
      <h1>All orders</h1>
      {error && <p className="error">{error}</p>}
      <div className="stats">
        <div className="stat s1"><span>Orders</span><strong>{(orders || []).length}</strong></div>
        <div className="stat s2"><span>Revenue</span><strong>{money(revenue)}</strong></div>
        <div className="stat s3"><span>Pending</span><strong>{(orders || []).filter((o) => o.status === 'processing').length}</strong></div>
      </div>
      <table className="table">
        <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Paid</th><th>Status</th></tr></thead>
        <tbody>
          {(orders || []).map((o) => (
            <tr key={o._id}>
              <td><Link to={`/orders/${o._id}`}>#{o._id.slice(-6).toUpperCase()}</Link></td>
              <td>{o.user?.name}<div className="muted small">{o.user?.email}</div></td>
              <td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
              <td>{money(o.totalPrice)}</td>
              <td>{o.isPaid ? 'Yes' : 'No'}</td>
              <td>
                <select value={o.status} onChange={(e) => changeStatus(o._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
