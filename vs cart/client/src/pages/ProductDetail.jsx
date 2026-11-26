import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, money, FREE_SHIPPING_MIN } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import ProductImage from '../components/ProductImage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Rating from '../components/Rating.jsx';
import { catLink } from '../categories.js';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    setProduct(null);
    setQty(1);
    window.scrollTo({ top: 0 });
    api(`/products/${id}`)
      .then((p) => {
        setProduct(p);
        return api(`/products?category=${encodeURIComponent(p.category)}&limit=6`);
      })
      .then((d) => setSimilar(d.products.filter((x) => x._id !== id).slice(0, 5)))
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p className="muted">Loading…</p>;

  const out = product.countInStock === 0;
  const delivery = new Date(Date.now() + 3 * 864e5).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <>
      <p className="crumbs">
        <Link to="/">Home</Link> › <Link to={catLink(product.category)}>{product.category}</Link> › {product.name}
      </p>
      <div className="detail card">
        <div className="detail-left">
          <ProductImage product={product} size="xl" />
          {!out && (
            <div className="buy-row">
              <button
                className="btn btn-yellow big"
                onClick={() => {
                  addItem(product, qty);
                  navigate('/cart');
                }}
              >
                🛒 ADD TO CART
              </button>
              <button
                className="btn btn-orange big"
                onClick={() => {
                  addItem(product, qty);
                  navigate('/checkout');
                }}
              >
                ⚡ BUY NOW
              </button>
            </div>
          )}
        </div>

        <div className="detail-right">
          <span className="muted">{product.brand}</span>
          <h1>{product.name}</h1>
          <Rating value={product.rating} count={product.numReviews} />
          <div className="prow big-price">
            <span className="price">{money(product.price)}</span>
            {product.mrp > product.price && <span className="mrp">{money(product.mrp)}</span>}
            {product.discount > 0 && <span className="off">{product.discount}% off</span>}
          </div>

          <div className="offers">
            <h4>Available offers</h4>
            <ul>
              <li><b>Bank Offer</b> 10% instant discount on card payments (demo)</li>
              <li><b>No Cost EMI</b> on orders above ₹3,000</li>
              <li><b>Free Delivery</b> on orders above {money(FREE_SHIPPING_MIN)}</li>
            </ul>
          </div>

          <p className="desc">{product.description}</p>
          <p>🚚 Delivery by <b>{delivery}</b></p>
          <p className={out ? 'error' : 'muted'}>{out ? 'Currently out of stock' : product.countInStock <= 5 ? `Hurry! Only ${product.countInStock} left` : 'In stock'}</p>

          {!out && (
            <label className="qty-pick">
              Quantity
              <select value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                {Array.from({ length: Math.min(product.countInStock, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="section">
          <div className="section-head"><h2>Similar products</h2></div>
          <div className="scroller">
            {similar.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
