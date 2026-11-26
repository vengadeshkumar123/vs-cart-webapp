import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductImage from '../components/ProductImage.jsx';

const STEPS = ['processing', 'shipped', 'delivered'];

function Tracker({ status }) {
  if (status === 'cancelled') return <p className="error">This order was cancelled.</p>;
  const idx = STEPS.indexOf(status);
  return (
    <div className="tracker">
      {STEPS.map((s, n) => (
        <div key={s} className={`tstep ${n <= idx ? 'on' : ''}`}>
          <span className="tdot">{n <= idx ? '✓' : n + 1}</span>
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/orders/${id}`).then(setOrder).catch((e) => setError(e.message));
  }, [id]);

  const pay = async () => {
    setBusy(true);
    try {
      // Demo only: marks the order paid. Swap for Razorpay/Stripe checkout in production.
      setOrder(await api(`/orders/${id}/pay`, { method: 'PUT' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!order) return <p className="muted">Loading…</p>;

  const a = order.shippingAddress;
  const ownOrder = String(order.user?._id || order.user) === String(user._id);

  return (
    <div>
      <div className="success card pad">
        <h1>🎉 Order #{order._id.slice(-6).toUpperCase()}</h1>
        <p>
          {order.isPaid ? <span className="green">Paid on {new Date(order.paidAt).toLocaleDateString('en-IN')}</span> : <span className="orange">Payment pending</span>}
          {' · '}Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}
        </p>
        <Tracker status={order.status} />
      </div>

      <div className="cart-layout">
        <div>
          <div className="card pad">
            <h3>Delivery address</h3>
            <p>{a.fullName}<br />{a.address}<br />{a.city} - {a.postalCode}<br />{a.country}</p>
          </div>
          <div className="card">
            <div className="card-title">Items</div>
            {order.items.map((i) => (
              <div className="cart-row" key={i._id}>
                <ProductImage product={i} size="sm" />
                <div className="grow"><Link to={`/product/${i.product}`} className="pname">{i.name}</Link></div>
                <span className="muted">{i.qty} × {money(i.price)}</span>
                <strong>{money(i.qty * i.price)}</strong>
              </div>
            ))}
          </div>
        </div>
        <aside className="card pricebox">
          <div className="card-title">PRICE DETAILS</div>
          <div className="pricebox-body">
            <div className="row between"><span>Items</span><span>{money(order.itemsPrice)}</span></div>
            <div className="row between"><span>Delivery</span><span>{order.shippingPrice === 0 ? <span className="green">Free</span> : money(order.shippingPrice)}</span></div>
            <hr />
            <div className="row between total"><strong>Total</strong><strong>{money(order.totalPrice)}</strong></div>
            <p className="muted small">Payment: {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card / UPI'}</p>
            {ownOrder && !order.isPaid && order.paymentMethod === 'card' && order.status !== 'cancelled' && (
              <button className="btn btn-orange big wide" onClick={pay} disabled={busy}>
                {busy ? 'Processing…' : `Pay ${money(order.totalPrice)} (demo)`}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
