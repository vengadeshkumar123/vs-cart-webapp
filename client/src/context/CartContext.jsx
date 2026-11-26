import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const load = () => {
  try {
    return JSON.parse(localStorage.getItem('vscart')) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    localStorage.setItem('vscart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) =>
    setItems((prev) => {
      const max = product.countInStock;
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, price: product.price, mrp: product.mrp, countInStock: max, qty: Math.min(i.qty + qty, max) } : i
        );
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          brand: product.brand,
          image: product.image,
          emoji: product.emoji,
          category: product.category,
          price: product.price,
          mrp: product.mrp,
          countInStock: max,
          qty: Math.min(qty, max),
        },
      ];
    });

  const setQty = (id, qty) =>
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.countInStock)) } : i)));

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i._id !== id));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrpTotal = items.reduce((s, i) => s + (i.mrp || i.price) * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, setQty, removeItem, clear, count, subtotal, mrpTotal }}>
      {children}
    </CartContext.Provider>
  );
}
