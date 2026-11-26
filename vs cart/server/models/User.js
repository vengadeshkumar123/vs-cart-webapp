const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const normalize = (row) => row && ({ ...row, _id: String(row.id), isAdmin: Boolean(row.isAdmin) });
async function findByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [String(email || '').toLowerCase().trim()]);
  return rows[0] || null;
}
async function findById(id) {
  const [rows] = await pool.execute('SELECT id, name, email, isAdmin, createdAt, updatedAt FROM users WHERE id = ?', [id]);
  return normalize(rows[0]);
}
async function create({ name, email, password, isAdmin = false }) {
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.execute('INSERT INTO users (name,email,password,isAdmin) VALUES (?,?,?,?)',
    [String(name).trim(), String(email).toLowerCase().trim(), hash, Boolean(isAdmin)]);
  return normalize(await findByEmail(String(email).toLowerCase().trim()));
}
async function verifyPassword(user, plain) { return user ? bcrypt.compare(plain || '', user.password) : false; }
module.exports = { findByEmail, findById, create, verifyPassword, normalize };
