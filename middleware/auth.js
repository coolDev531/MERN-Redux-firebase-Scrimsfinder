const jwt = require('jsonwebtoken');
const KEYS = require('../config/keys');

module.exports = async function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader.split(' ')[1]; // jwt token

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    await jwt.verify(token, KEYS.SECRET_OR_KEY, (error, decoded) => {
      if (error) {
        res.status(401).json({ msg: 'Token is not valid' });
      } else {
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    console.error('something wrong with auth middleware');
    res.status(500).json({ msg: 'Server Error' });
  }
};
