import { useState } from 'react';
import { tileStyle } from '../categories.js';

// Shows the product image if one is set, otherwise a coloured gradient tile with the product emoji.
export default function ProductImage({ product, size = 'md' }) {
  const [failed, setFailed] = useState(false);

  if (product.image && !failed) {
    return (
      <img
        className={`pimg ${size}`}
        src={product.image}
        alt={product.name}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className={`ptile ${size}`} style={tileStyle(product.category)} role="img" aria-label={product.name}>
      <span>{product.emoji || '🛍️'}</span>
    </div>
  );
}
