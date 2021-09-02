const User = require('../models/user');

const createUser = async (req, res) => {
  try {
    const { uid, name, discord, rank, adminKey, email } = req.body;

    const userData = {
      uid,
      name,
      discord,
      rank,
      adminKey,
      email,
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
  createUser,
  loginUser,
};
