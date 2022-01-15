const jwt = require('jsonwebtoken');
const KEYS = require('../config/keys');

module.exports = async function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');
  const token = authHeader.split(' ')[1]; // jwt token

  // Check if not token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  // Verify token
  try {
    return jwt.verify(token, KEYS.SECRET_OR_KEY, (error, decodedUser) => {
      if (error) {
        res.status(401).json({ error: 'Token is not valid' });
      } else {
        if (String(decodedUser.adminKey) !== String(KEYS.ADMIN_KEY)) {
          return res.status(401).json({ error: 'unauthorized' });
        }
        req.user = decodedUser;
        next();
      }
    });
  } catch (err) {
    console.error('something wrong with auth + admin middleware');
    res.status(500).json({ error: 'Server Error' });
  }
};
