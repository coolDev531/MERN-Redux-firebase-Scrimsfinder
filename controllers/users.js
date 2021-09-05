const User = require('../models/user');
const db = require('../db/connection');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const getAllUsers = async (req, res) => {
  const region = req.query?.region;
  // /api/users?region=NA
  if (region) {
    try {
      // don't show other fields, using select.
      const users = await User.find({ region }).select([
        'discord',
        'name',
        'region',
      ]);
      return res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // if no region, just get all users.
    try {
      const users = await User.find().select(['discord', 'name', 'region']); // show only discord and name.
      return res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  await User.findByIdAndUpdate(id, req.body, { new: true }, (error, user) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!user) {
      return res.status(404).json(user);
    }
    res.status(200).json(user);
  });
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    let user = await User.findOne({ _id: id }).select([
      'discord',
      'name',
      'region',
    ]);

    if (!user) return res.status(404).json({ message: 'User not found!' });

    // using populate to show more than _id when using Ref on the model.
    return res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
};
