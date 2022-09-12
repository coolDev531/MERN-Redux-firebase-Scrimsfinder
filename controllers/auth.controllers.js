// utils
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const escape = require('escape-html');
const { REGIONS } = require('../utils/constants');
const KEYS = require('../config/keys');
const { unbanUser, banDateExpired } = require('../utils/adminUtils');
const { validateRank, checkSummonerNameValid } = require('../utils/validators');
const { removeSpacesBeforeHashTag } = require('../utils/discord');

// models
const User = require('../models/user.model');
const Ban = require('../models/ban.model');
const {
  createLoginHistory,
} = require('../services/createLoginHistory.services');

require('dotenv').config();

// get google uid and email by using google auth firebase, then give rest of user data hosted in database.
// same as verify user but with more edge-cases.
const loginUser = async (req, res) => {
  const { email, uid } = req.body;

  let error;

  if (!email) {
    res.status(401).json({
      error: 'Unauthorized',
    });
    return;
  }

  if (!uid) {
    res.status(401).json({
      error: 'Unauthorized',
    });
    return;
  }

  // will find the one user with the exact uid and email combination
  const foundUser = await User.findOne({ email });

  if (!foundUser) {
    res.status(500).json({
      error: `User not found with the email: ${escape(
        email
      )}, please sign up or try again.`,
    });
    return;
  }

  try {
    // Check uid
    const isMatch = await bcrypt.compare(uid, foundUser.uid); // compare unhashed req.body.uid to hashed user uid in db.

    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized', status: false });
    }

    if (foundUser.currentBan.isActive) {
      // unban user if date passed
      if (banDateExpired(foundUser.currentBan.dateTo)) {
        await unbanUser(foundUser);
      } else {
        const foundBan = await Ban.findById(foundUser.currentBan?._ban);

        return res.status(401).json({
          error: `You are banned until ${new Date(
            foundUser.currentBan.dateTo
          ).toLocaleDateString()}. ${
            foundBan.reason ? `\nReason: ${foundBan.reason}` : ''
          }`,
        });
      }
    }

    const payload = {
      uid: foundUser.uid,
      email: foundUser.email,
      rank: foundUser.rank,
      _id: foundUser._id,
      region: foundUser.region,
      discord: foundUser.discord,
      adminKey: foundUser.adminKey,
      isAdmin: foundUser.adminKey === KEYS.ADMIN_KEY,
      name: foundUser.name,
      notifications: foundUser.notifications,
      friendRequests: foundUser.friendRequests,
      friends: foundUser.friends,
      canSendEmailsToUser: foundUser.canSendEmailsToUser ?? false, // didn't exist on db in older versions
    };

    // I don't even think we need to hash the uid...
    const accessToken = jwt.sign(payload, KEYS.SECRET_OR_KEY, {
      expiresIn: KEYS.JWT_EXPIRATION,
    });

    // the user last logged in now, and save it in db.
    foundUser.lastLoggedIn = Date.now();

    // get login info for security purposes.
    if (process.env.NODE_ENV === 'production') {
      try {
        await createLoginHistory(req, foundUser);
      } catch (error) {
        error = error;
      }
    }

    await foundUser.save();

    return res.json({
      success: true,
      token: `Bearer ${accessToken}`,
      error,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const registerUser = async (req, res) => {
  let error;

  try {
    const {
      uid,
      name,
      discord,
      rank,
      adminKey = '',
      email,
      region,
      canSendEmailsToUser = false,
    } = req.body;

    const noSpacesDiscord = removeSpacesBeforeHashTag(discord);

    const userData = {
      uid,
      name: name.trim(),
      discord: noSpacesDiscord,
      rank,
      adminKey,
      email,
      region,
      lastLoggedIn: Date.now(),
      canSendEmailsToUser,
    };

    const userExists = await User.findOne({ email });

    const summonerNameTaken = await User.findOne({
      name: { $regex: `^${userData.name}$`, $options: 'i' }, // case insensitive name matching
      region,
    });

    const discordTaken = await User.findOne({
      discord: { $regex: `^${noSpacesDiscord}$`, $options: 'i' },
    });

    const regionInvalid = !REGIONS.includes(region);

    const isValidRank = await validateRank({
      rank,
      req,
      res,
    });

    if (!isValidRank) return;

    if (regionInvalid) {
      return res.status(500).json({
        error: 'Invalid region provided.',
      });
    }

    if (discordTaken) {
      return res.status(500).json({
        error: `Error: User with discord: ${discord} already exists!`,
      });
    }

    if (userExists) {
      return res.status(500).json({
        error: `Error: User with email ${email} already exists!`,
      });
    }

    if (summonerNameTaken) {
      return res.status(500).json({
        error: `Error: User with summoer name ${name} already exists in ${region}!`,
      });
    }

    const summonerNameInvalid = checkSummonerNameValid(userData.name);

    if (summonerNameInvalid) {
      return res.status(500).json({
        error: 'Error: no special characters in name field allowed!',
      });
    }

    const newUser = new User(userData);

    const salt = await bcrypt.genSalt(10);

    bcrypt.hash(newUser.uid, salt, async (err, hash) => {
      if (err) throw err;

      newUser.uid = hash; // hash google uid to use as token, maybe there's something better that google provides as token.

      const payload = {
        uid: newUser.uid,
        email: newUser.email,
        rank: newUser.rank,
        _id: newUser._id,
        region: newUser.region,
        discord: newUser.discord,
        adminKey: newUser.adminKey,
        canSendEmailsToUser: newUser.canSendEmailsToUser ?? false,
        isAdmin: false,
        name: newUser.name,
        notifications: [],
        friendRequests: [],
        friends: [],
      };

      const accessToken = jwt.sign(payload, KEYS.SECRET_OR_KEY, {
        expiresIn: KEYS.JWT_EXPIRATION,
      });

      // get login info for security purposes.
      if (process.env.NODE_ENV === 'production') {
        try {
          await createLoginHistory(req, newUser);
        } catch (error) {
          error = error;
        }
      }

      await newUser.save();

      console.log('User created: ', newUser);
      return res.status(201).json({
        success: true,
        token: `Bearer ${accessToken}`,
        user: newUser,
        error,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

// get google and email by using google auth firebase, then give rest of user data hosted in database.
const verifyUser = async (req, res) => {
  try {
    const user = req.user ?? false; // comes from auth middleware

    if (!user) {
      console.log('no user');
      return res.status(401).json({ error: 'Unauthorized', status: false });
    }

    // will find the one user with the exact uid and email combination
    const foundUser = await User.findOne({
      email: { $eq: user.email },
      uid: { $eq: user.uid },
    });

    if (!foundUser) {
      return res.status(500).json({
        message: 'User not found!',
      });
    }

    const payload = {
      uid: foundUser.uid,
      email: foundUser.email,
      rank: foundUser.rank,
      _id: foundUser._id,
      region: foundUser.region,
      discord: foundUser.discord,
      adminKey: foundUser.adminKey,
      isAdmin: foundUser.adminKey === KEYS.ADMIN_KEY,
      name: foundUser.name,
      notifications: foundUser.notifications,
      friendRequests: foundUser.friendRequests,
      friends: foundUser.friends,
    };

    const accessToken = jwt.sign(payload, KEYS.SECRET_OR_KEY, {
      expiresIn: KEYS.JWT_EXPIRATION,
    });

    // the user last logged in now, and save it in db.
    foundUser.lastLoggedIn = Date.now();
    await foundUser.save();

    return res.status(200).json({
      success: true,
      token: `Bearer ${accessToken}`,
      user: foundUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = req.user ?? false; // comes from auth middleware

    if (!user) {
      return res.status(500).json({ status: false, message: 'unauthorized' });
    }

    const foundUser = await User.findById(user?._id);

    if (!foundUser) {
      return res.status(500).json({ status: false, message: 'user not found' });
    }

    // check for valid rank
    if (req.body.rank) {
      const isValidRank = await validateRank({
        rank: req.body.rank,
        req,
        res,
      });

      if (!isValidRank) return;
    }

    // check for valid region
    if (req.body.region) {
      const regionInvalid = !REGIONS.includes(req.body.region);

      if (regionInvalid) {
        return res.status(500).json({
          error: 'Invalid region provided.',
          status: false,
        });
      }
    }

    const summonerNameInvalid = checkSummonerNameValid(req.body.name);

    if (summonerNameInvalid) {
      return res.status(500).json({
        error: 'Error: no special characters in name field allowed!',
      });
    }

    const isAdmin = req.body.adminKey === KEYS.ADMIN_KEY;

    const payload = {
      uid: foundUser.uid,
      email: foundUser.email,
      _id: foundUser._id,
      rank: req.body.rank ?? foundUser.rank,
      region: req.body.region ?? foundUser.region,
      discord: req.body.discord ?? foundUser.discord,
      adminKey: req.body.adminKey ?? foundUser.adminKey,
      name: req.body.name?.trim() ?? foundUser.name,

      isAdmin,

      profileBackgroundImg:
        req.body.profileBackgroundImg ??
        foundUser?.profileBackgroundImg ??
        'Summoners Rift',

      profileBackgroundBlur:
        req.body.profileBackgroundBlur ??
        foundUser?.profileBackgroundBlur ??
        '20',

      notifications: foundUser.notifications,
      friendRequests: foundUser.friendRequests,
      friends: foundUser.friends,

      canSendEmailsToUser: req.body.canSendEmailsToUser ?? false,
    };

    const accessToken = jwt.sign(payload, KEYS.SECRET_OR_KEY, {
      expiresIn: KEYS.JWT_EXPIRATION,
    });

    await User.findByIdAndUpdate(
      user._id,
      payload,
      { new: true },
      (error, updatedUser) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        if (!updatedUser) {
          return res.status(404).json(updatedUser);
        }

        return res.status(201).json({
          success: true,
          token: `Bearer ${accessToken}`,
          user: updatedUser,
        });
      }
    );
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  loginUser,
  registerUser,
  verifyUser,
  updateUser,
};
