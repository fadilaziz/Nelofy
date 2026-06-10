import jwt from 'jsonwebtoken';
import sql from '../database/db.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.SECRET_KEY_JWT, (err, user) => {
    if (err) {
      return res.status(403).json({ code: 403, message: 'Forbidden' });
    }
    req.userId = user.id;
    next();
  });
};

export const verifyAdminToken = (req, res, next) => {
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.SECRET_KEY_JWT, (err, user) => {
    if (err) {
      return res.status(403).json({ code: 403, message: 'Forbidden' });
    }
    req.userId = user.id;
    next();
  });
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await sql`SELECT role FROM users WHERE id = ${req.userId}`;
    if (user.count === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ code: 403, message: 'Forbidden: Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ code: 500, message: error.message });
  }
};
