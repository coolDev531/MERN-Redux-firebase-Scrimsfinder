const db = require('../db/connection');

// models
const User = require('../models/user');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// get google uid and email by using google auth firebase, then give rest of user data hosted in database.
// same as verify user but with errors.
const loginUser = async (req, res) => {
  const { email, uid } = req.body;

  if (!email) {
    res.status(500).json({
      error: `No Email Provided`,
    });
    return;
  }

  if (!uid) {
    res.status(500).json({
      error: `No google id Provided.`,
    });
    return;
  }

  // will find the one user with the exact uid and email combination
  const foundUser = await User.findOne({ uid, email });

  if (!foundUser) {
    res.status(500).json({
      error: `User not found with the email: ${email}, please sign up or try again.`,
    });
    return;
  }

  if (foundUser) {
    return res.json(foundUser);
  }
};

// get google uid and email by using google auth firebase, then give rest of user data hosted in database.
const verifyUser = async (req, res) => {
  const { email, uid } = req.body;

  // will find the one user with the exact uid and email combination
  const foundUser = await User.findOne({ uid, email });

  if (foundUser) {
    return res.json(foundUser);
  }
};

module.exports = {
  loginUser,
  verifyUser,
};
