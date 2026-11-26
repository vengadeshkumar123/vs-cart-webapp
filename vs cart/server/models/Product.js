const { pool } = require('../config/db');
const fields = ['name','brand','description','price','mrp','discount','image','emoji','category','countInStock','rating','numReviews'];
const normalize = (r) => r && ({ ...r, _id: String(r.id), price: Number(r.price), mrp: Number(r.mrp), rating: Number(r.rating), discount: Number(r.discount), countInStock: Number(r.countInStock), numReviews: Number(r.numReviews) });
const columns = 'id,name,brand,description,price,mrp,discount,image,emoji,category,countInStock,rating,numReviews,createdAt,updatedAt';
function values(obj) {
  const v = { ...obj };
  v.name = String(v.name || '').trim(); v.category = String(v.category || '').trim();
  v.brand = String(v.brand || '').trim(); v.description = v.description || ''; v.image = v.image || ''; v.emoji = v.emoji || '🛍️';
  v.price = Number(v.price); v.mrp = Number(v.mrp || v.price); if (v.mrp < v.price) v.mrp = v.price;
  v.discount = v.mrp > 0 ? Math.round(((v.mrp-v.price)/v.mrp)*100) : 0;
  v.countInStock = Number(v.countInStock || 0); v.rating = Number(v.rating || 0); v.numReviews = Number(v.numReviews || 0);
  return v;
}
async function findById(id) { const [r] = await pool.execute(`SELECT ${columns} FROM products WHERE id=?`, [id]); return normalize(r[0]); }
async function count(filters={}) {
  const where = filters.where || '1=1'; const params = filters.params || [];
  const [r] = await pool.execute(`SELECT COUNT(*) total FROM products WHERE ${where}`, params); return Number(r[0].total);
}
async function list(where='1=1', params=[], order='numReviews DESC', offset=0, limit=12) {
  const [r] = await pool.execute(`SELECT ${columns} FROM products WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, Number(limit), Number(offset)]); return r.map(normalize);
}
async function categories() { const [r] = await pool.query('SELECT DISTINCT category FROM products ORDER BY category'); return r.map(x=>x.category); }
async function create(obj) { const v=values(obj); const [result]=await pool.execute('INSERT INTO products (name,brand,description,price,mrp,discount,image,emoji,category,countInStock,rating,numReviews) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', fields.map(k=>v[k])); return findById(result.insertId); }
async function update(id,obj) { const old=await findById(id); if(!old)return null; const v=values({...old,...obj}); await pool.execute('UPDATE products SET name=?,brand=?,description=?,price=?,mrp=?,discount=?,image=?,emoji=?,category=?,countInStock=?,rating=?,numReviews=? WHERE id=?',[...fields.map(k=>v[k]),id]); return findById(id); }
async function remove(id) { const [r]=await pool.execute('DELETE FROM products WHERE id=?',[id]); return r.affectedRows>0; }
module.exports = { findById, count, list, categories, create, update, remove, normalize, columns };
