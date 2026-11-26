import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');

  useEffect(() => {
    setQ(params.get('q') || '');
  }, [params]);

  const search = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : '/');
  };

  return (
    <header className="hdr">
      <div className="container hdr-in">
        <Link to="/" className="logo">
          <span className="logo-main"><span className="logo-vs">VS</span> Cart</span>
          <span className="logo-sub">Explore <b>Plus</b> ✦</span>
        </Link>

        <form className="search" onSubmit={search} role="search">
          <input
            placeholder="Search for products, brands and more"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search"
          />
          <button aria-label="Search">🔍</button>
        </form>

        {user ? (
          <div className="menu">
            <span className="menu-title">👤 {user.name.split(' ')[0]} ▾</span>
            <div className="menu-list">
              <Link to="/orders">📦 My Orders</Link>
              {user.isAdmin && <Link to="/admin/products">🛠️ Manage Products</Link>}
              {user.isAdmin && <Link to="/admin/orders">📊 All Orders</Link>}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="login-btn">Login</Link>
        )}

        <Link to="/cart" className="cart-link">
          🛒 Cart{count > 0 && <span className="badge">{count}</span>}
        </Link>
      </div>
    </header>
  );
}
