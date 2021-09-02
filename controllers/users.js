const User = require('../models/user');

const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
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

  const foundUser = User.find({ uid, email }).exec();

  if (!req.body.email) {
    return res.status(500).json({
      error: `No Email Provided`,
    });
  }

  if (!foundUser) {
    return res.status(500).json({
      error: `User doesn't exist with the email ${email}, please sign up.`,
    });
  }

  if (foundUser) {
    console.log({ foundUser });
    return res.json(foundUser);
  }
};

module.exports = {
  createUser,
  loginUser,
};
