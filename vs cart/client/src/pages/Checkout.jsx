import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money, shippingFor } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Checkout() {
  const { items, subtotal, mrpTotal, clear, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ fullName: user?.name || '', address: '', city: '', postalCode: '', country: 'India' });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const shipping = shippingFor(subtotal);
  const set = (k) => (e) => setAddress({ ...address, [k]: e.target.value });

  if (items.length === 0) {
    return (
      <div className="empty card">
        <div className="empty-emoji">🛒</div>
        <h3>Nothing to checkout</h3>
        <Link to="/" className="btn btn-blue">Shop now</Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const order = await api('/orders', {
        method: 'POST',
        body: {
          items: items.map((i) => ({ product: i._id, qty: i.qty })),
          shippingAddress: address,
          paymentMethod,
        },
      });
      clear();
      navigate(`/orders/${order._id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cart-layout">
      <form className="card" onSubmit={submit}>
        <div className="step-head"><span className="step-no done">1</span> LOGIN <span className="green">✓</span> <span className="muted">{user.email}</span></div>
        <div className="step-head active"><span className="step-no">2</span> DELIVERY ADDRESS</div>
        <div className="form pad">
          {error && <p className="error">{error}</p>}
          <label>Full name<input required value={address.fullName} onChange={set('fullName')} /></label>
          <label>Address (house no, street, area)<input required value={address.address} onChange={set('address')} /></label>
          <div className="row">
            <label className="grow">City<input required value={address.city} onChange={set('city')} /></label>
            <label className="grow">Pincode<input required value={address.postalCode} onChange={set('postalCode')} /></label>
          </div>
          <label>Country<input required value={address.country} onChange={set('country')} /></label>
        </div>
        <div className="step-head active"><span className="step-no">3</span> PAYMENT OPTIONS</div>
        <div className="form pad">
          <label className="radio"><input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> 💳 Card / UPI (demo payment on the next page)</label>
          <label className="radio"><input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> 💵 Cash on Delivery</label>
          <button className="btn btn-orange big" disabled={busy}>{busy ? 'Placing order…' : 'PLACE ORDER'}</button>
        </div>
      </form>

      <aside className="card pricebox">
        <div className="card-title">PRICE DETAILS</div>
        <div className="pricebox-body">
          {items.map((i) => (
            <div className="row between small" key={i._id}><span>{i.emoji} {i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>
          ))}
          <hr />
          <div className="row between"><span>Price ({count} items)</span><span>{money(mrpTotal)}</span></div>
          <div className="row between"><span>Discount</span><span className="green">− {money(mrpTotal - subtotal)}</span></div>
          <div className="row between"><span>Delivery Charges</span><span>{shipping === 0 ? <span className="green">Free</span> : money(shipping)}</span></div>
          <hr />
          <div className="row between total"><strong>Total Payable</strong><strong>{money(subtotal + shipping)}</strong></div>
          <p className="muted small">Final prices are confirmed by the server.</p>
        </div>
      </aside>
    </div>
  );
}
