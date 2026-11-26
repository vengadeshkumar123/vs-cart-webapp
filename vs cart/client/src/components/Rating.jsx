export default function Rating({ value = 0, count }) {
  if (!value) return null;
  const tone = value >= 4 ? 'good' : value >= 3 ? 'ok' : 'bad';
  return (
    <span className="rating-wrap">
      <span className={`rating ${tone}`}>{value.toFixed(1)} ★</span>
      {count > 0 && <span className="muted small">({count.toLocaleString('en-IN')})</span>}
    </span>
  );
}
