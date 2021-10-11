const User = require('../models/user');
const Scrim = require('../models/scrim');
const KEYS = require('../config/keys');
const mongoose = require('mongoose');

const getAllUsers = async (req, res) => {
  const region = req.query?.region;
  // /api/users?region=NA
  if (region) {
    try {
      // don't show other fields, using select.
      const users = await User.find({ region }).select([
        'discord',
        'name',
        'rank',
        'region',
        'createdAt',
        'updatedAt',
      ]);
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    // if no region, just get all users.
    try {
      const users = await User.find().select([
        'discord',
        'name',
        'rank',
        'region',
        'createdAt',
        'updatedAt',
      ]);
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

const getOneUser = async (req, res) => {
  try {
    let { name } = req.params;
    let region = req.query.region;

    // if user wasn't provided in the query, set it to the first user you can find that matches the name
    if (!region) {
      let allUsers = await User.find();
      let foundUser = allUsers.find(
        (user) => user.name.toLowerCase() === name.toLowerCase()
      );
      region = foundUser.region;
    }

    region = region.toUpperCase();

    const regions = ['NA', 'EUW', 'EUNE', 'LAN'];

    if (!regions.includes(region)) {
      return res.status(404).json({
        message:
          'Invalid region, please select one of the following: NA, EUW, EUNE, LAN.',
      });
    }

    const adminKeyQuery = req?.query?.adminKey === KEYS.ADMIN_KEY ?? false;

    const nameRegex = `^${name}$`;

    let user = await User.findOne({
      name: { $regex: nameRegex, $options: 'i' }, // case insensitive name matching
      region,
    }).select([
      'discord',
      'name',
      'region',
      'rank',
      'adminKey',
      adminKeyQuery && 'email', // for when admins want to see the details (not user profile page)
      'createdAt',
      adminKeyQuery && 'updatedAt', // only show updatedAt when req.query.admin key has been entered and is correct
      'profileBackgroundImg',
      'profileBackgroundBlur',
    ]);

    if (!user)
      return res
        .status(404)
        .json({ message: `User not found in region: ${region}` });

    let userWithNoAdminKey = {
      ...user._doc,
      isAdmin: user.adminKey === KEYS.ADMIN_KEY, // boolean,
    };

    let deletedAdminKey = delete userWithNoAdminKey.adminKey;

    if (adminKeyQuery) {
      // if we provided admin key in postman, show email and admin key.
      return res.status(200).json(user);
    }

    if (deletedAdminKey) {
      return res.status(200).json(userWithNoAdminKey);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserCreatedScrims = async (req, res) => {
  try {
    const { id } = req.params;

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    let user = await User.findById(id);

    let scrims = await Scrim.find();

    if (!user) return res.status(404).json({ message: 'User not found!' });

    const userCreatedScrims = scrims.filter(
      (scrim) => String(scrim.createdBy) === String(user._id)
    );
    return res.json(userCreatedScrims);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get scrims where the user was a caster, or a player
const getUserParticipatedScrims = async (req, res) => {
  try {
    const { id } = req.params;

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    let user = await User.findById(id);

    let scrims = await Scrim.find();

    if (!user) return res.status(404).json({ message: 'User not found!' });

    const userParticipatedScrims = scrims.filter((scrim) => {
      if (!scrim.teamWon) return false; // if no team won, that means the game didn't end yet.

      const scrimTeams = [...scrim.teamOne, ...scrim.teamTwo];

      const scrimPlayers = scrimTeams.map(({ _user }) => String(_user));

      const foundPlayer = scrimPlayers.find((id) => String(user._id) === id);

      const foundCaster = scrim.casters.find(
        (id) => String(id) === String(user._id)
      );

      if (foundPlayer) {
        return true;
      }

      if (foundCaster) {
        return true;
      }

      // else if he wasn't a caster or a player return false.
      return false;
    });
    return res.json(userParticipatedScrims);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getOneUser,
  getUserCreatedScrims,
  getUserParticipatedScrims,
};
