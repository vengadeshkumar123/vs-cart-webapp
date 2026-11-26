import { Link, useNavigate } from 'react-router-dom';
import { money, shippingFor, FREE_SHIPPING_MIN } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import ProductImage from '../components/ProductImage.jsx';

export default function Cart() {
  const { items, setQty, removeItem, subtotal, mrpTotal, count } = useCart();
  const navigate = useNavigate();
  const shipping = shippingFor(subtotal);
  const discount = mrpTotal - subtotal;

  if (items.length === 0) {
    return (
      <div className="empty card">
        <div className="empty-emoji">🛒</div>
        <h3>Your cart is empty!</h3>
        <p className="muted">Add items to it now.</p>
        <Link to="/" className="btn btn-blue">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="card">
        <div className="card-title">My Cart ({count})</div>
        {items.map((i) => (
          <div className="cart-row" key={i._id}>
            <Link to={`/product/${i._id}`}><ProductImage product={i} size="sm" /></Link>
            <div className="grow">
              <Link to={`/product/${i._id}`} className="pname">{i.name}</Link>
              <div className="muted small">{i.brand}</div>
              <div className="prow">
                {i.mrp > i.price && <span className="mrp">{money(i.mrp)}</span>}
                <span className="price">{money(i.price)}</span>
                {i.mrp > i.price && <span className="off">{Math.round(((i.mrp - i.price) / i.mrp) * 100)}% off</span>}
              </div>
              <div className="row">
                <div className="stepper">
                  <button onClick={() => setQty(i._id, i.qty - 1)} disabled={i.qty <= 1} aria-label="Decrease">−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => setQty(i._id, i.qty + 1)} disabled={i.qty >= i.countInStock} aria-label="Increase">+</button>
                </div>
                <button className="link-btn" onClick={() => removeItem(i._id)}>REMOVE</button>
              </div>
            </div>
            <strong>{money(i.price * i.qty)}</strong>
          </div>
        ))}
        <div className="place-bar">
          <button className="btn btn-orange big" onClick={() => navigate('/checkout')}>PLACE ORDER</button>
        </div>
      </div>

      <aside className="card pricebox">
        <div className="card-title">PRICE DETAILS</div>
        <div className="pricebox-body">
          <div className="row between"><span>Price ({count} item{count > 1 ? 's' : ''})</span><span>{money(mrpTotal)}</span></div>
          <div className="row between"><span>Discount</span><span className="green">− {money(discount)}</span></div>
          <div className="row between"><span>Delivery Charges</span><span>{shipping === 0 ? <span className="green">Free</span> : money(shipping)}</span></div>
          <hr />
          <div className="row between total"><strong>Total Amount</strong><strong>{money(subtotal + shipping)}</strong></div>
          {discount > 0 && <p className="green save">You will save {money(discount)} on this order 🎉</p>}
          {shipping > 0 && <p className="muted small">Add items worth {money(FREE_SHIPPING_MIN - subtotal)} more for free delivery.</p>}
        </div>
      </aside>
    </div>
  );
}
