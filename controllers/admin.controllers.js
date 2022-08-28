const KEYS = require('../config/keys');
const User = require('../models/user.model');
const Ban = require('../models/ban.model');
const { unbanUser: utilUnbanUser } = require('../utils/adminUtils');
const { validateRank } = require('../utils/validators');

const banUser = async (req, res) => {
  try {
    const { user = {} } = req;

    const { banUserId = '', dateFrom, dateTo, reason = '' } = req.body;

    if (!banUserId) {
      return res.status(500).json({
        error: 'no user id provided',
      });
    }

    if (!dateFrom) {
      return res.status(500).json({
        error: 'no date from provided',
      });
    }

    if (!dateTo) {
      return res.status(500).json({
        error: 'no date to provided',
      });
    }

    let userToBan = await User.findById(String(banUserId));

    if (!userToBan) {
      return res.status(500).json({
        error: 'no user found',
      });
    }

    if (userToBan.currentBan.isActive) {
      return res.status(500).json({
        error: 'user is already banned',
      });
    }

    if (userToBan.adminKey === KEYS.ADMIN_KEY) {
      return res.status(500).json({
        error: 'You cannot ban an admin',
      });
    }

    const newBan = new Ban({
      _user: userToBan,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      _bannedBy: user._id,
      isActive: true,
      reason,
    });

    const savedBan = await newBan.save();

    userToBan.currentBan = {
      isActive: true,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      _bannedBy: user,
      _ban: savedBan._id,
    };

    if (!userToBan.bansHistory) {
      userToBan.bansHistory = [newBan];
    } else {
      userToBan.bansHistory.push(newBan);
    }

    await userToBan.markModified('currentBan');
    await userToBan.markModified('bansHistory');

    const updatedUser = await userToBan.save();

    return res.status(200).json({
      success: true,
      dateFrom,
      dateTo,
      bannedUserId: updatedUser._id,
      _bannedBy: user._id,
      _ban: savedBan._id,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { user = {} } = req;

    const { bannedUserId = '' } = req.body;

    if (Object.keys(user) <= 0) {
      return res.status(401).message({ error: 'unauthorized' });
    }

    if (user.adminKey !== KEYS.ADMIN_KEY) {
      return res.status(401).json({
        error: 'unauthorized',
      });
    }

    if (!bannedUserId) {
      return res.status(500).json({
        error: 'no user id provided',
      });
    }

    const selectedUser = await User.findOne({ _id: { $eq: bannedUserId } });

    if (!selectedUser) {
      return res.status(500).json({
        error: 'no user found',
      });
    }

    if (!selectedUser.currentBan.isActive) {
      return res.status(500).json({
        error: 'user is not banned',
      });
    }

    const { savedBan, updatedUser } = await utilUnbanUser(selectedUser);

    return res.status(200).json({
      success: true,
      unbannedUserId: updatedUser._id,
      _bannedBy: user._id,
      updatedBan: savedBan,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllBans = async (req, res) => {
  try {
    const populateUser = ['name', 'discord', 'region'];

    const _allBans = await Ban.find()
      .populate('_bannedBy', populateUser)
      .populate('_unbannedBy', populateUser)
      .populate('_user', populateUser)
      .exec((err, data) => {
        if (err) {
          console.log(err);
          return res.status(400).end();
        }
        return res.json(data);
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateUserAsAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    // check for valid rank
    if (req.body.rank) {
      const isValidRank = await validateRank({
        rank: req.body.rank,
        req,
        res,
      });

      if (!isValidRank) return;
    }

    return await User.findByIdAndUpdate(
      userId,
      req.body,
      { new: true },
      async (error, user) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        if (!user) {
          return res.status(500).send('User not found');
        }

        user.save();

        return res.status(200).json(user);
      }
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  banUser,
  unbanUser,
  getAllBans,
  updateUserAsAdmin,
};
