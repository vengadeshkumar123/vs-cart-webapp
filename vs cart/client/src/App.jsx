import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import { catLink } from './categories.js';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-cols">
        <div>
          <h4>About</h4>
          <Link to="/">VS Cart</Link>
          <a href="#top">Careers</a>
          <a href="#top">Press</a>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to={catLink('Mobiles')}>Mobiles</Link>
          <Link to={catLink('Fashion')}>Fashion</Link>
          <Link to={catLink('Home & Kitchen')}>Home &amp; Kitchen</Link>
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/orders">Your Orders</Link>
          <a href="#top">Shipping</a>
          <a href="#top">Returns</a>
        </div>
        <div>
          <h4>VS Cart</h4>
          <p>Demo e-commerce app. Orders and payments here are for testing only.</p>
        </div>
      </div>
      <div className="footer-bar">© {new Date().getFullYear()} VS Cart. All rights reserved.</div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container main" id="top">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
          <Route path="*" element={<p>Page not found. <Link to="/">Go home</Link></p>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
