const jwt = require('jsonwebtoken');
const KEYS = require('../config/keys');
const User = require('../models/user.model');
const Ban = require('../models/ban.model');
const { unbanUser, banDateExpired } = require('../utils/adminUtils');

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
    return jwt.verify(token, KEYS.SECRET_OR_KEY, async (error, decodedUser) => {
      if (error) {
        res.status(401).json({ error: 'Token is not valid' });
      } else {
        req.user = decodedUser;

        //  check if user is banned
        const foundUser = await User.findById(req.user._id);

        if (foundUser?.currentBan?.isActive) {
          // unban user if date passed
          if (banDateExpired(foundUser?.currentBan?.dateTo)) {
            await unbanUser(foundUser);
          } else {
            const foundBan = await Ban.findById(foundUser?.currentBan?._ban);

            return res.status(401).json({
              error: `You are banned until ${new Date(
                foundUser.currentBan.dateTo
              ).toLocaleDateString()}. ${
                foundBan.reason ? `\nReason: ${foundBan.reason}` : ''
              }`,
            });
          }
        }

        // run next function
        next();
      }
    });
  } catch (err) {
    console.error('something wrong with auth middleware');
    res.status(500).json({ error: 'Server Error' });
  }
};
