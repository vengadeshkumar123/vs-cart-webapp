import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { CATEGORIES, chipStyle, catLink } from '../categories.js';
import Banner from '../components/Banner.jsx';
import ProductCard from '../components/ProductCard.jsx';

const PRICES = [
  { id: '', label: 'Any price' },
  { id: '0-500', label: 'Under ₹500' },
  { id: '500-2000', label: '₹500 – ₹2,000' },
  { id: '2000-10000', label: '₹2,000 – ₹10,000' },
  { id: '10000-50000', label: '₹10,000 – ₹50,000' },
  { id: '50000-', label: 'Over ₹50,000' },
];
const RATINGS = [
  { id: '', label: 'Any rating' },
  { id: '4', label: '4★ & above' },
  { id: '3', label: '3★ & above' },
];
const SORTS = [
  { id: 'popular', label: 'Popularity' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'discount', label: 'Discount' },
  { id: 'newest', label: 'Newest First' },
];

export default function Home() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'popular';
  const price = params.get('price') || '';
  const rating = params.get('rating') || '';
  const page = parseInt(params.get('page'), 10) || 1;

  const [data, setData] = useState({ products: [], pages: 1, total: 0 });
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/products?sort=discount&limit=10').then((d) => setDeals(d.products)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page, limit: 12, sort });
    if (q) qs.set('q', q);
    if (category) qs.set('category', category);
    if (price) {
      const [min, max] = price.split('-');
      if (min) qs.set('minPrice', min);
      if (max) qs.set('maxPrice', max);
    }
    if (rating) qs.set('minRating', rating);
    api(`/products?${qs}`)
      .then((d) => {
        setData(d);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q, category, sort, price, rating, page]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next);
  };

  const browsing = !q && !category;
  const heading = q ? `Results for “${q}”` : category || 'All Products';

  return (
    <>
      <nav className="catstrip" aria-label="Categories">
        {CATEGORIES.map((c) => (
          <Link key={c.name} to={catLink(c.name)} className={`catitem ${category === c.name ? 'active' : ''}`}>
            <span className="caticon" style={chipStyle(c.name)}>{c.icon}</span>
            <span>{c.name}</span>
          </Link>
        ))}
      </nav>

      {browsing && <Banner />}

      {browsing && deals.length > 0 && (
        <section className="section deals">
          <div className="section-head">
            <h2>🔥 Deals of the Day</h2>
            <button className="btn btn-blue btn-sm" onClick={() => update({ sort: 'discount' })}>View all</button>
          </div>
          <div className="scroller">
            {deals.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      <div className="shop">
        <aside className="sidebar">
          <h3>Filters</h3>
          <div className="fgroup">
            <h4>Category</h4>
            <label><input type="radio" name="cat" checked={!category} onChange={() => update({ category: '' })} /> All</label>
            {CATEGORIES.map((c) => (
              <label key={c.name}>
                <input type="radio" name="cat" checked={category === c.name} onChange={() => update({ category: c.name })} /> {c.name}
              </label>
            ))}
          </div>
          <div className="fgroup">
            <h4>Price</h4>
            {PRICES.map((p) => (
              <label key={p.id}>
                <input type="radio" name="price" checked={price === p.id} onChange={() => update({ price: p.id })} /> {p.label}
              </label>
            ))}
          </div>
          <div className="fgroup">
            <h4>Customer Ratings</h4>
            {RATINGS.map((r) => (
              <label key={r.id}>
                <input type="radio" name="rating" checked={rating === r.id} onChange={() => update({ rating: r.id })} /> {r.label}
              </label>
            ))}
          </div>
          {(q || category || price || rating) && (
            <button className="btn btn-sm wide" onClick={() => setParams(new URLSearchParams())}>Clear all filters</button>
          )}
        </aside>

        <section className="results">
          <div className="results-head">
            <div>
              <h2>{heading}</h2>
              <span className="muted small">{data.total} products</span>
            </div>
          </div>
          <div className="sortbar">
            <span className="muted">Sort By</span>
            {SORTS.map((s) => (
              <button key={s.id} className={`sort ${sort === s.id ? 'active' : ''}`} onClick={() => update({ sort: s.id })}>
                {s.label}
              </button>
            ))}
          </div>

          {error && <p className="error">{error}</p>}
          {loading ? (
            <p className="muted pad">Loading products…</p>
          ) : data.products.length === 0 ? (
            <div className="empty">
              <div className="empty-emoji">🔎</div>
              <h3>Sorry, no results found</h3>
              <p className="muted">Try a different keyword or clear the filters.</p>
            </div>
          ) : (
            <div className="grid">
              {data.products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {data.pages > 1 && (
            <div className="pagination">
              <button className="btn" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>‹ Previous</button>
              <span>Page {page} of {data.pages}</span>
              <button className="btn" disabled={page >= data.pages} onClick={() => update({ page: String(page + 1) })}>Next ›</button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
