const User = require('../models/user');

const getAllUsers = async (req, res) => {
  const region = req.query?.region;
  // /api/users?region=NA
  if (region) {
    try {
      const users = await User.find({ region });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // if no region, just get all users.
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

const createUser = async (req, res) => {
  try {
    const { uid, name, discord, rank, adminKey, email, region } = req.body;

    const userData = {
      uid,
      name,
      discord,
      rank,
      adminKey,
      email,
      region,
    };

    const userExists = await User.find({ uid, email });

    if (userExists.length) {
      return res.status(500).json({
        error: 'User with email already exists!',
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

  if (!email) {
    return res.status(500).json({
      error: `No Email Provided`,
    });
  }

  if (!uid) {
    return res.status(500).json({
      error: `No google id Provided.`,
    });
  }

  // will find the one user with the exact uid and email combination
  const foundUser = await User.findOne({ uid, email });

  if (!foundUser) {
    return res.status(500).json({
      error: `User doesn't with the email: ${email}, please sign up or try again.`,
    });
  }

  if (foundUser) {
    return res.json(foundUser);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  verifyUser,
};
