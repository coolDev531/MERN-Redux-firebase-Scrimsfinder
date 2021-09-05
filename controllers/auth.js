const db = require('../db/connection');

// models
const User = require('../models/user');

/**
 * @method removeSpacesBeforeHashTag
 * takes a discord name and trims the spaces.
 * @param {String} str
 * @returns {String}
 */
const removeSpacesBeforeHashTag = (str) => {
  // for discord name
  return str
    .trim()
    .replace(/\s([#])/g, function (el1, el2) {
      return '' + el2;
    })
    .replace(/(«)\s/g, function (el1, el2) {
      return el2 + '';
    });
};

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

const registerUser = async (req, res) => {
  try {
    const { uid, name, discord, rank, adminKey, email, region } = req.body;

    const noSpacesDiscord = removeSpacesBeforeHashTag(discord);

    const userData = {
      uid,
      name,
      discord: noSpacesDiscord,
      rank,
      adminKey,
      email,
      region,
    };

    const userExists = await User.find({ uid, email });

    const discordTaken = await User.findOne({ discord: noSpacesDiscord });

    if (discordTaken) {
      return res.status(500).json({
        error: `Error: User with discord: ${discord} already exists!`,
      });
    }

    if (userExists.length) {
      return res.status(500).json({
        error: `Error: User with email ${email} already exists!`,
      });
    }

    const user = new User(userData);
    await user.save();
    res.status(201).json(user);
    console.log('User created: ', user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
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
  registerUser,
};
