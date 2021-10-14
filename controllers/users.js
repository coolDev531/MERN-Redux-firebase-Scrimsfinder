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
      'friends',
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

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const adminKeyQuery = req?.query?.adminKey === KEYS.ADMIN_KEY ?? false;

    const user = await User.findById(id).select([
      'discord',
      'name',
      'region',
      'rank',
      'notifications',
      'adminKey',
      adminKeyQuery && 'email', // for when admins want to see the details (not user profile page)
      'createdAt',
      adminKeyQuery && 'updatedAt', // only show updatedAt when req.query.admin key has been entered and is correct
      'profileBackgroundImg',
      'profileBackgroundBlur',
      'friendRequests',
      'friends',
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

const pushUserNotification = async (req, res) => {
  const { id } = req.params;
  const relatedUserId = req?.body?.relatedUserId ?? null;

  const user = await User.findById(id);

  const foundRelatedUser = relatedUserId
    ? await User.findById(relatedUserId)
    : null;

  if (!req.body.message) {
    return res.status(500).json({ error: 'no message provided!' });
  }

  const newNotification = {
    message: req.body.message,
    _relatedUser: foundRelatedUser,
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

        user.save();

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

const removeAllUserNotifications = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(500).send('user not found');
    }

    const reqBody = {
      notifications: [],
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

        return res.status(200).json({
          notifications: user.notifications,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const { userSendingId, userReceivingId } = req.params;
    const userSending = await User.findById(userSendingId);
    const userReceiving = await User.findById(userReceivingId);

    const newFriendRequest = {
      _user: {
        _id: userSending._id,
        name: userSending.rank,
        region: userSending.region,
        discord: userSending.discord,
      },
    };

    let newNotification = {
      relatedUserId: userSendingId,
      message: `${userSending.name} sent you a friend request!`,
    };

    const reqBody = {
      friendRequests: [...userReceiving.friendRequests, newFriendRequest],
      notifications: [...userReceiving.notifications, newNotification],
    };

    await User.findByIdAndUpdate(
      userReceivingId,
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

        return res.status(200).json({
          newFriendRequest,
          newNotification,
        });
      }
    );

    return;
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const removeFriendRequest = async (req, res) => {
  try {
    const { requestId, userId } = req.params;
    const user = await User.findById(userId);

    const reqBody = {
      friendRequests: user.friendRequests.filter(
        ({ _id }) => String(_id) !== requestId
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

        user.save();

        return res.status(200).json({
          removedFriendRequestId: requestId,
          friendRequests: user.friendRequests,
        });
      }
    );

    return;
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
  pushUserNotification,
  removeUserNotification,
  removeAllUserNotifications,
  sendFriendRequest,
  removeFriendRequest,
};
