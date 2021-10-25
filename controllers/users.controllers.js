const User = require('../models/user.model');
const Scrim = require('../models/scrim.model');
const KEYS = require('../config/keys');
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
      'friendRequests',
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
      'friendRequests',
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

const sendFriendRequest = async (req, res) => {
  try {
    const { userSendingId, userReceivingId } = req.params;

    const userSending = await User.findById(userSendingId);
    const userReceiving = await User.findById(userReceivingId);

    const sendingToSelf = String(userSendingId) === String(userReceivingId);

    if (sendingToSelf) {
      return res.status(500).json({
        error: 'Friend request cannot be sent to yourself',
      });
    }

    const friendRequestFound = userReceiving.friendRequests.find(
      ({ _user }) => String(_user) === String(userSending._id)
    );

    if (friendRequestFound) {
      return res.status(500).json({
        error: `Friend request already sent to: ${userReceiving.name} by ${userSending.name}`,
      });
    }

    const newFriendRequest = {
      _user: {
        _id: userSending._id,
        name: userSending.rank,
        region: userSending.region,
        discord: userSending.discord,
      },
    };

    //  add a new notification to the user
    let newNotification = {
      _relatedUser: userSendingId,
      message: `${userSending.name} sent you a friend request!`,
      isFriendRequest: true,
      createdDate: Date.now(),
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

        await user.save();

        return res.status(200).json({
          newFriendRequest: {
            ...newFriendRequest,
            _user: userSending._id,
          },

          newNotification,
          sentToUser: `${userReceiving.name} (${userReceiving.region})`,
          sentToUserId: userReceiving._id,
        });
      }
    );

    return;
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST /users/:userId/remove-friend-request/:requestId
// @desc    remove one friend request from user (ex: reject a friend request)
// @access  Public
const removeFriendRequest = async (req, res) => {
  try {
    const { requestId, userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({ error: 'User not found' });
    }

    const filteredFriendRequests = user.friendRequests.filter(
      ({ _id }) => String(_id) !== requestId
    );

    user.friendRequests = filteredFriendRequests;

    await user.save();

    return res.status(200).json({
      removedFriendRequestId: requestId,
      friendRequests: user.friendRequests,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST api/users/add-new-friend/:id
// @desc    add a new friend to both parties (the friend requesting and accepting), this happens when a friend request is accepted
// @access  Public
const addUserFriend = async (req, res) => {
  const { id } = req.params;

  const { newFriendUserId } = req.body;

  const sendingToSelf = String(newFriendUserId) === String(id);

  if (sendingToSelf) {
    return res.status(500).json({
      error: 'Friend request cannot be accepted by yourself',
    });
  }

  // user receiving the  friend request
  let user = await User.findById(id);

  // user sent the friendRequest
  let friendUser = await User.findById(newFriendUserId);

  if (!user) {
    return res.status(500).send(`User not found with id: ${escape(id)}`);
  }

  if (!friendUser) {
    return res
      .status(500)
      .send(`Friend user not found with id: ${escape(newFriendUserId)}`);
  }

  if (user.friends.find(({ _id }) => String(_id) === String(friendUser._id))) {
    res.status(500).send({ error: 'Friend already added!' });
    return;
  }

  if (friendUser.friends.find(({ _id }) => String(_id) === String(user._id))) {
    res.status(500).send({ error: 'Friend already added!' });
    return;
  }

  if (user.friends) {
    user.friends.push(friendUser);
  } else {
    user.friends = [friendUser];
  }

  await user.save();

  if (friendUser.friends) {
    friendUser.friends.push(user);
  } else {
    friendUser.friends = [user];
  }

  await friendUser.save();

  return res.status(200).json({
    updatedUserFriends: user.friends,
    updatedFriendFriends: friendUser.friends,
  });
};

// @route   POST api/users/remove-friend/:id
// @desc    when both users are already friends but one user decides to "Unfriend" the friend.
// @access  Public
const removeUserFriend = async (req, res) => {
  const { id } = req.params;

  const { friendUserId } = req.body;

  // user making the friend deletion call
  let user = await User.findById(id);

  // user's friend
  let friendUser = await User.findById(friendUserId);

  if (!user) {
    return res.status(500).send(`User not found with id: ${escape(id)}`);
  }

  if (!friendUser) {
    return res
      .status(500)
      .send(`Friend user not found with id: ${escape(friendUserId)}`);
  }

  user.friends = user.friends.filter(
    ({ _id }) => String(_id) !== String(friendUser._id)
  );

  await user.save();

  friendUser.friends = friendUser.friends.filter(
    ({ _id }) => String(_id) !== String(user._id)
  );

  await friendUser.save();

  return res.status(200).json({
    userFriends: user.friends,
    friendUserFriends: friendUser.friends,
  });
};

const nestedPopulate = (path, modelPath) => {
  // nested populate
  return {
    path: path,
    populate: {
      path: modelPath,
      model: 'User',
      select: 'name discord rank region', // exclude adminKey,uid and email from showing
    },
  };
};

// @route   GET api/users/user-friend-requests/:id
// @desc    get friend requests for that specific user.
// @access  Public
const getUserFriendRequests = async (req, res) => {
  try {
    const { id } = req.params;

    return await User.findById(id)
      .populate(nestedPopulate('friendRequests', '_user'))
      .exec((err, user) => {
        const friendRequests = user?.friendRequests ?? [];
        if (err) {
          console.log(err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json(friendRequests);
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /users/user-friends/:id
// @desc    get all the friends for that specific user
// @access  Public
const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    return await User.findById(id)
      .populate(nestedPopulate('friends', '_id'))
      .exec((err, user) => {
        const friends = user?.friends ?? [];
        if (err) {
          console.log(err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json(friends);
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
  sendFriendRequest,
  removeFriendRequest,
  addUserFriend,
  removeUserFriend,
  getUserFriendRequests,
  getUserFriends,
};
