import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { catLink } from '../categories.js';

const SLIDES = [
  { tag: 'BIG BILLION SAVINGS', title: 'Up to 60% off on Mobiles', sub: 'Latest 5G phones with no-cost EMI', emoji: '📱', category: 'Mobiles', bg: 'linear-gradient(120deg,#5b2fc9,#2874f0 60%,#2cb5e8)' },
  { tag: 'LAPTOP FEST', title: 'Laptops from ₹17,990', sub: 'Work, study and play. Bank offers on every order', emoji: '💻', category: 'Laptops', bg: 'linear-gradient(120deg,#f7971e,#ff5f6d)' },
  { tag: 'FASHION CARNIVAL', title: 'Min. 50% off on Fashion', sub: 'Tees, jeans, kurtas, hoodies and more', emoji: '👗', category: 'Fashion', bg: 'linear-gradient(120deg,#f953c6,#b91d73 70%,#7b1fa2)' },
  { tag: 'HOME MAKEOVER', title: 'Kitchen & Appliances Sale', sub: 'Cookware, kettles, washing machines and ACs', emoji: '🏠', category: 'Home & Kitchen', bg: 'linear-gradient(120deg,#11998e,#38ef7d 90%)' },
];

export default function Banner() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const s = SLIDES[i];
  const go = (d) => setI((n) => (n + d + SLIDES.length) % SLIDES.length);

  return (
    <div className="banner" style={{ background: s.bg }}>
      <button className="arrow left" onClick={() => go(-1)} aria-label="Previous">‹</button>
      <div className="slide">
        <div className="slide-text">
          <span className="slide-tag">{s.tag}</span>
          <h2>{s.title}</h2>
          <p>{s.sub}</p>
          <Link to={catLink(s.category)} className="btn btn-white">Shop now →</Link>
        </div>
        <div className="slide-emoji" aria-hidden="true">{s.emoji}</div>
      </div>
      <button className="arrow right" onClick={() => go(1)} aria-label="Next">›</button>
      <div className="dots">
        {SLIDES.map((_, n) => (
          <button key={n} className={`dot ${n === i ? 'active' : ''}`} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} />
        ))}
      </div>
    </div>
  );
}
