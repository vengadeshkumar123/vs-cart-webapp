// Category names must match the `category` values used in server/seed.js
export const CATEGORIES = [
  { name: 'Mobiles', icon: '📱', from: '#7f5af0', to: '#2cb5e8' },
  { name: 'Laptops', icon: '💻', from: '#f7971e', to: '#ffb400' },
  { name: 'Electronics', icon: '🎧', from: '#ee0979', to: '#ff6a00' },
  { name: 'TVs & Appliances', icon: '📺', from: '#00c6ff', to: '#0072ff' },
  { name: 'Fashion', icon: '👕', from: '#f953c6', to: '#b91d73' },
  { name: 'Footwear', icon: '👟', from: '#11998e', to: '#38ef7d' },
  { name: 'Home & Kitchen', icon: '🍳', from: '#f46b45', to: '#eea849' },
  { name: 'Beauty', icon: '💄', from: '#fc5c7d', to: '#6a82fb' },
  { name: 'Sports', icon: '🏏', from: '#43cea2', to: '#185a9d' },
  { name: 'Toys', icon: '🧸', from: '#ff758c', to: '#ff7eb3' },
  { name: 'Books', icon: '📚', from: '#614385', to: '#516395' },
  { name: 'Grocery', icon: '🛒', from: '#56ab2f', to: '#a8e063' },
];

const FALLBACK = { from: '#2874f0', to: '#7f5af0' };
export const catInfo = (name) => CATEGORIES.find((c) => c.name === name) || FALLBACK;

export const tileStyle = (name) => {
  const c = catInfo(name);
  return { background: `linear-gradient(135deg, ${c.from}33, ${c.to}77)` };
};
export const chipStyle = (name) => {
  const c = catInfo(name);
  return { background: `linear-gradient(135deg, ${c.from}, ${c.to})` };
};
export const catLink = (name) => `/?category=${encodeURIComponent(name)}`;
