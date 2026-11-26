import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(name, email, password);
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
        <h2>Looks like you're new here!</h2>
        <p>Sign up with your email to get started.</p>
        <div className="auth-emoji">🎁</div>
      </div>
      <form className="auth-form" onSubmit={submit}>
        {error && <p className="error">{error}</p>}
        <label>Full name<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password (min 6 characters)<input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button className="btn btn-orange big" disabled={busy}>{busy ? 'Creating…' : 'Continue'}</button>
        <Link to="/login" state={location.state} className="newuser">Existing user? Log in</Link>
      </form>
    </div>
  );
}
