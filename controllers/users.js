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

    const user = new User(userData);
    await user.save();
    res.status(201).json(user);
    console.log('User created: ', user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { uid } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(500).json({
      error: `No Email Provided`,
    });
  }

  const foundUser = User.find({ uid, email }).exec();
  console.log({ foundUser });

  if (!foundUser) {
    return res.status(500).json({
      error: `User doesn't exist with the email ${email}, please sign up.`,
    });
  }

  if (foundUser) {
    return res.json(foundUser);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  loginUser,
};
