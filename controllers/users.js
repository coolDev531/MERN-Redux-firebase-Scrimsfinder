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
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // if no region, just get all users.
    try {
      const users = await User.find().select(['discord', 'name', 'region']); // show only discord and name.
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

const createUser = async (req, res) => {
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
  createUser,
  updateUser,
};
