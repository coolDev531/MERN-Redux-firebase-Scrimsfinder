const User = require('../models/user.model');
const Scrim = require('../models/scrim.model');
const mongoose = require('mongoose');
const escape = require('escape-html'); // sanitize request params
const { REGIONS } = require('../utils/constants');

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

    let user = await User.findOne({
      name: { $regex: nameRegex, $options: 'i' }, // case insensitive name matching
      region,
    }).select([
      'discord',
      'name',
      'region',
      'rank',
      'isAdmin',
      'createdAt',
      'profileBackgroundImg',
      'profileBackgroundBlur',
      'friends',
    ]);

    if (!user)
      return res
        .status(404)
        .json({ message: `User not found in region: ${escape(region)}` });

    return res.status(200).json(user);
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

// @route   GET /api/users/user-notifications/:id
// @desc    get a specific users notifications
// @access  Public
const getUserNotifications = async (req, res) => {
  try {
    // should probably have some sort of authorization here by comparing uid with bcrypt.
    const { id } = req.params;

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    let user = await User.findById(id);

    if (!user) return res.status(404).json({ message: 'User not found!' });

    return res.json({ notifications: user.notifications });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST api/users/:id/push-notification/
// @desc    send a notification to a specific user
// @access  Public
const pushUserNotification = async (req, res) => {
  const { id } = req.params;
  const relatedUserId = req?.body?.relatedUserId ?? null;
  const relatedScrimId = req?.body?.relatedScrimId ?? null;

  const user = await User.findById(id);

  const foundRelatedUser = relatedUserId
    ? await User.findById(relatedUserId)
    : null;

  const foundRelatedScrim = relatedScrimId
    ? await Scrim.findById(relatedScrimId)
    : null;

  if (!req.body.message) {
    return res.status(500).json({ error: 'no message provided!' });
  }

  if (!req.body.createdDate) {
    return res.status(500).json({ error: 'no createdDate provided!' });
  }

  const newNotification = {
    message: req.body.message,
    _relatedUser: foundRelatedUser, // should probably be user sent by (friend request)
    _relatedScrim: foundRelatedScrim, // _relatedScrim isn't used it, but would be for a scrim that he is participating in (10 min heads up notification?)
    createdDate: new Date(req.body.createdDate), // we don't need this because mongoose already provides timestamps, I think I did this because of a bug.
  };

  const reqBody = {
    notifications: [...user.notifications, newNotification],
  };

  await User.findByIdAndUpdate(
    id,
    reqBody,
    { new: true },
    async (error, user) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (!user) {
        return res.status(500).send('User not found');
      }

      user.save();
      return res.status(200).json({ notifications: user.notifications });
    }
  );
};

// @route   POST /api/users/:userId/remove-notification/:notificationId
// @desc    remove one notification from a user (ex: mark as read)
// @access  Public
const removeUserNotification = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).send('user not found');
    }

    const reqBody = {
      notifications: user.notifications.filter(
        (notification) => String(notification._id) !== String(notificationId)
      ),
    };

    await User.findByIdAndUpdate(
      userId,
      reqBody,
      { new: true },
      async (error, user) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        if (!user) {
          return res.status(500).send('User not found');
        }

        await user.save();

        return res.status(200).json({
          deletedNotificationId: notificationId,
          notifications: user.notifications,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST /api/users/remove-all-notifications/:id
// @desc    remove all user notifications. (ex: mark all as read)
// @access  Public
const removeAllUserNotifications = async (req, res) => {
  try {
    const { id } = req.params;

    let user = await User.findById(id);

    if (!user) {
      return res.status(500).send('User not found');
    }

    user.notifications = [];

    await user.save();

    return res.status(200).json({
      notifications: user.notifications,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getOneUser,
  getUserCreatedScrims,
  getUserParticipatedScrims,
  getUserNotifications,
  getUserById,
  pushUserNotification,
  removeUserNotification,
  removeAllUserNotifications,
};
