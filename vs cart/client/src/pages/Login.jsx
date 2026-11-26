import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth card">
      <div className="auth-side">
        <h2>Login</h2>
        <p>Get access to your orders, wishlist and recommendations.</p>
        <div className="auth-emoji">🛍️</div>
      </div>
      <form className="auth-form" onSubmit={submit}>
        {error && <p className="error">{error}</p>}
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn btn-orange big" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
        <p className="muted small">Demo: user@example.com / user123 &nbsp;·&nbsp; Admin: admin@example.com / admin123</p>
        <Link to="/register" state={location.state} className="newuser">New to VS Cart? Create an account</Link>
      </form>
    </div>
  );
}
