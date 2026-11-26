import { useEffect, useState } from 'react';
import { api, money } from '../api.js';
import { CATEGORIES } from '../categories.js';

const empty = { name: '', brand: '', category: 'Mobiles', emoji: '🛍️', description: '', price: '', mrp: '', countInStock: '', image: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api('/products?limit=50&sort=newest')
      .then((d) => setProducts(d.products))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const body = { ...form, price: Number(form.price), mrp: Number(form.mrp) || 0, countInStock: Number(form.countInStock) };
    try {
      if (editingId) await api(`/products/${editingId}`, { method: 'PUT', body });
      else await api('/products', { method: 'POST', body });
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      brand: p.brand || '',
      category: p.category,
      emoji: p.emoji || '🛍️',
      description: p.description || '',
      price: p.price,
      mrp: p.mrp || '',
      countInStock: p.countInStock,
      image: p.image || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api(`/products/${p._id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Manage products</h1>
      {error && <p className="error">{error}</p>}
      <form className="card form pad" onSubmit={submit}>
        <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
        <div className="row">
          <label className="grow">Name<input required value={form.name} onChange={set('name')} /></label>
          <label className="grow">Brand<input value={form.brand} onChange={set('brand')} /></label>
        </div>
        <div className="row">
          <label className="grow">Category
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
            </select>
          </label>
          <label>Emoji<input value={form.emoji} onChange={set('emoji')} maxLength={4} style={{ width: 80 }} /></label>
        </div>
        <div className="row">
          <label className="grow">Selling price (₹)<input type="number" step="0.01" min="0" required value={form.price} onChange={set('price')} /></label>
          <label className="grow">MRP (₹)<input type="number" step="0.01" min="0" value={form.mrp} onChange={set('mrp')} /></label>
          <label className="grow">Stock<input type="number" min="0" required value={form.countInStock} onChange={set('countInStock')} /></label>
        </div>
        <label>Description<textarea rows="3" value={form.description} onChange={set('description')} /></label>
        <label>Image URL (optional, emoji tile is used when empty)<input value={form.image} onChange={set('image')} /></label>
        <div className="row">
          <button className="btn btn-blue">{editingId ? 'Save changes' : 'Add product'}</button>
          {editingId && (
            <button type="button" className="btn" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>
          )}
        </div>
      </form>

      <table className="table">
        <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Off</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.emoji}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{money(p.price)}</td>
              <td>{p.discount}%</td>
              <td>{p.countInStock}</td>
              <td className="actions">
                <button className="btn btn-sm" onClick={() => edit(p)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => remove(p)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
