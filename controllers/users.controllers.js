const User = require('../models/user.model');
const Scrim = require('../models/scrim.model');
const mongoose = require('mongoose');
const escape = require('escape-html'); // sanitize request params
const { REGIONS } = require('../utils/constants');
const KEYS = require('../config/keys');

// @route   GET /api/users
// @desc    get all users for the app
// @access  Public
const getAllUsers = async (req, res) => {
  const region = req.query?.region;
  // /api/users?region=NA
  // optional query to get the users in a specific region, not used in the app
  if (region) {
    try {
      // don't show other fields, using select.
      const users = await User.find({ region: { $eq: region } }).select([
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

// @route   GET /api/users/:name?region="region" (NA, LAN, EUW,EUNE, OCE)
// @desc    get one user by name, also accepts region query, used in the user profile page
// @access  Public
const getOneUser = async (req, res) => {
  try {
    let { name } = req.params;
    let region = req.query.region;

    // if region wasn't provided in the query, set it to the first user you can find that matches the name
    if (!region) {
      let foundUser = await User.findOne({
        name: {
          $regex: `^${name}$`,
          $options: 'i',
        },
      })
        .sort({ createdAt: 'desc' }) // first user created first
        .exec();

      region = foundUser.region;
    }

    // upper case region if casing misspelled on postman.
    region = region.toUpperCase();

    if (!REGIONS.includes(region)) {
      return res.status(404).json({
        message:
          'Invalid region, please select one of the following: NA, EUW, EUNE, LAN, OCE',
      });
    }

    const nameRegex = `^${name}$`;

    const userAdminKey = await User.findOne({
      name: { $regex: nameRegex, $options: 'i' }, // case insensitive name matching
      region,
    }).select(['adminKey']);

    let user = await User.findOne({
      name: { $regex: nameRegex, $options: 'i' }, // case insensitive name matching
      region,
    }).select([
      'discord',
      'name',
      'region',
      'rank',
      'createdAt',
      'profileBackgroundImg',
      'profileBackgroundBlur',
      'friends',
      'isDonator',
      'currentBan',
    ]);

    if (!user)
      return res
        .status(404)
        .json({ message: `User not found in region: ${escape(region)}` });

    const isAdmin = userAdminKey.adminKey === KEYS.ADMIN_KEY;

    return res.status(200).json({ ...user._doc, isAdmin });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET api/users/:id/created-scrims
// @desc    get all scrims that were created by that one user. (can only be seen by if _id === self._id at UserProfile page)
// @access  Public
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

// @route   GET /api/users/:id/scrims
// @desc    get scrims where the user praticipated, ex: user was a caster, or a player (used in UserProfile page)
// @access  Public
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

      const foundPlayer = scrimPlayers.find(
        (userId) => String(user._id) === String(userId)
      );

      const foundCaster = scrim.casters.find(
        (casterId) => String(casterId) === String(user._id)
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

// @route   GET /api/users/by-id/:id
// @desc    get a specific user by user._id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select([
      'discord',
      'name',
      'region',
      'rank',
      'notifications',
      'isAdmin',
      'createdAt',
      'updatedAt',
      'profileBackgroundImg',
      'profileBackgroundBlur',
      'friends',
    ]);

    if (!user)
      return res
        .status(404)
        .json({ message: `User not found with id: ${escape(id)}` });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getOneUser,
  getUserCreatedScrims,
  getUserParticipatedScrims,
  getUserById,
};
