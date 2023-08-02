const jwt = require('jsonwebtoken');
const pool = require('../utils/db');
const mssql = require('mssql');
require('dotenv').config();

module.exports = async (req, res, next) => {
  const jwtoken = req.cookies.token;
  if (!jwtoken) {
    return res.status(401).json({ message: '尚未登入' });
  }
  try {
    jwt.verify(jwtoken, process.env.JWT_SECRET);
  } catch (err) {
    if ((err = 'TokenExpiredError: jwt expired')) return res.status(401).json({ message: '憑證過期，請重新登入' });
  }

  return res.json();
};
