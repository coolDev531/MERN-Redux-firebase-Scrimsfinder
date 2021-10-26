const KEYS = require('../config/keys');

// api key middleware
function apiKey(req, res, next) {
  // x-api-key
  // if not x-api-key header
  // if not right key
  if (!req.header('x-api-key') || req.header('x-api-key') !== KEYS.API_KEY) {
    res.status(401);
    return res.json({ message: 'Invalid API key' });
  }

  next();
}

module.exports = apiKey;
