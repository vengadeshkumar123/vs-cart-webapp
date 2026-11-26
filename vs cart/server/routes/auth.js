const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const router = express.Router();
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const userPayload = (u) => ({ _id: String(u.id), name: u.name, email: u.email, isAdmin: Boolean(u.isAdmin), token: signToken(String(u.id)) });
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) { res.status(400); throw new Error('Name, email and password are required'); }
  if (String(password).length < 6) { res.status(400); throw new Error('Password must be at least 6 characters'); }
  if (await User.findByEmail(email)) { res.status(400); throw new Error('An account with that email already exists'); }
  let user;
  try { user = await User.create({ name, email, password }); }
  catch (e) { if (e.code === 'ER_DUP_ENTRY') { res.status(400); throw new Error('An account with that email already exists'); } throw e; }
  res.status(201).json(userPayload(user));
}));
router.post('/login', asyncHandler(async (req, res) => {
  const user = await User.findByEmail(req.body.email);
  if (!user || !(await User.verifyPassword(user, req.body.password || ''))) { res.status(401); throw new Error('Invalid email or password'); }
  res.json(userPayload(user));
}));
router.get('/me', protect, asyncHandler(async (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, isAdmin: req.user.isAdmin });
}));
module.exports = router;
