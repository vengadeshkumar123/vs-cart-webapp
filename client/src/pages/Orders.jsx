import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import ProductImage from '../components/ProductImage.jsx';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders/mine').then(setOrders).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!orders) return <p className="muted">Loading…</p>;

  if (orders.length === 0) {
    return (
      <div className="empty card">
        <div className="empty-emoji">📦</div>
        <h3>No orders yet</h3>
        <Link to="/" className="btn btn-blue">Start shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>My Orders</h1>
      {orders.map((o) => (
        <Link to={`/orders/${o._id}`} className="card order-card" key={o._id}>
          <div className="order-thumbs">
            {o.items.slice(0, 3).map((i) => <ProductImage key={i._id} product={i} size="xs" />)}
          </div>
          <div className="grow">
            <strong>{o.items[0].name}{o.items.length > 1 ? ` + ${o.items.length - 1} more` : ''}</strong>
            <div className="muted small">Order #{o._id.slice(-6).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
          </div>
          <strong>{money(o.totalPrice)}</strong>
          <span className={`status ${o.status}`}>{o.status}</span>
        </Link>
      ))}
    </div>
  );
}
