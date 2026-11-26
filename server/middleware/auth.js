const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('./error');
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) { res.status(401); throw new Error('Not authorized, no token'); }
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch { res.status(401); throw new Error('Not authorized, token invalid or expired'); }
  if (!req.user) { res.status(401); throw new Error('Not authorized, user no longer exists'); }
  next();
});
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  res.status(403); next(new Error('Admin access required'));
};
module.exports = { protect, admin };
