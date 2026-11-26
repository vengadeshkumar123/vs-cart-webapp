import { useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import ProductImage from './ProductImage.jsx';
import Rating from './Rating.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const out = product.countInStock === 0;

  const add = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="pcard">
      <Link to={`/product/${product._id}`} className="pcard-img">
        <ProductImage product={product} />
        {product.discount > 0 && <span className="pbadge">{product.discount}% off</span>}
        {out && <span className="oos">Out of stock</span>}
      </Link>
      <div className="pcard-body">
        <div className="pbrand">{product.brand || product.category}</div>
        <Link to={`/product/${product._id}`} className="pname" title={product.name}>{product.name}</Link>
        <Rating value={product.rating} count={product.numReviews} />
        <div className="prow">
          <span className="price">{money(product.price)}</span>
          {product.mrp > product.price && <span className="mrp">{money(product.mrp)}</span>}
          {product.discount > 0 && <span className="off">{product.discount}% off</span>}
        </div>
        {!out && product.countInStock <= 5 && <div className="stock-warn">Only {product.countInStock} left!</div>}
        <button className={`btn btn-yellow wide ${added ? 'done' : ''}`} disabled={out} onClick={add}>
          {out ? 'Unavailable' : added ? '✓ Added' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}
