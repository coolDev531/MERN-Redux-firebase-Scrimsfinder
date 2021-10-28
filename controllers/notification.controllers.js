const mongoose = require('mongoose');
const User = require('../models/user.model');

// @route   GET /api/notifications/user-notifications
// @desc    get a specific users notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const id = req.user._id;

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

// @route   POST api/notifications/push-user-notification/:userId
// @desc    send a notification to a specific user
// @access  Public
const pushUserNotification = async (req, res) => {
  const { userId } = req.params;
  const relatedUserId = req?.body?.relatedUserId ?? null;
  const relatedScrimId = req?.body?.relatedScrimId ?? null;

  const user = await User.findById(userId);

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
        notifications: user.notifications,
        newNotification: newNotification,
      });
    }
  );
};

// @route   POST api/notifications/remove-user-notification/:notificationId
// @desc    remove one notification from a user (ex: mark as read)
// @access  Private
const removeUserNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const userId = req.user._id;

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

// @route   POST /notifications/remove-all-user-notifications/:id
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
  getUserNotifications,
  pushUserNotification,
  removeUserNotification,
  removeAllUserNotifications,
};
