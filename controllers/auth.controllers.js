const KEYS = require('../config/keys');
// jwt
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// models
const User = require('../models/user.model');

const divisionsWithNumbers = [
  'Iron',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
];

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

const allowedRanks = [
  'Uranked',
  'Iron',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Master',
  'Grandmaster',
  'Challenger',
];

// get google uid and email by using google auth firebase, then give rest of user data hosted in database.
// same as verify user but with errors.
const loginUser = async (req, res) => {
  const { email, uid } = req.body;

  if (!email) {
    res.status(500).json({
      error: `No Email Provided`,
    });
    return;
  }

  if (!uid) {
    res.status(500).json({
      error: `No google id Provided.`,
    });
    return;
  }

  // will find the one user with the exact uid and email combination
  const foundUser = await User.findOne({ email });

  if (!foundUser) {
    res.status(500).json({
      error: `User not found with the email: ${email}, please sign up or try again.`,
    });
    return;
  }

  // Check uid
  try {
    const isMatch = bcrypt.compare(uid, foundUser.uid); // compare req.body.uid to user uid in db.

    if (isMatch) {
      const payload = {
        uid: foundUser.uid,
        email: foundUser.email,
        rank: foundUser.rank,
        _id: foundUser._id,
        region: foundUser.region,
        discord: foundUser.discord,
        adminKey: foundUser.adminKey,
        name: foundUser.name,
        notifications: foundUser.notifications,
        friendRequests: foundUser.friendRequests,
        friends: foundUser.friends,
      };

      const accessToken = jwt.sign(payload, KEYS.SECRET_OR_KEY, {
        expiresIn: 31556926, // 1 year in seconds
        // expiresIn: new Date(new Date()).setDate(new Date().getDate() + 30), // 30 days from now, does this work?
      });

      return res.json({ success: true, token: 'Bearer ' + accessToken });
    } else {
      return res.status(500).json('password incorrect');
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { uid, name, discord, rank, adminKey = '', email, region } = req.body;

    const noSpacesDiscord = removeSpacesBeforeHashTag(discord);

    const userData = {
      uid,
      name: name.trim(),
      discord: noSpacesDiscord,
      rank,
      adminKey,
      email,
      region,
    };

    const userExists = await User.findOne({ email });

    const summonerNameTaken = await User.findOne({
      name: { $regex: `^${userData.name}$`, $options: 'i' }, // case insensitive name matching
      region,
    });

    const discordTaken = await User.findOne({
      discord: { $regex: `^${noSpacesDiscord}$`, $options: 'i' },
    });

    const regionInvalid = !['NA', 'OCE', 'EUW', 'EUNE', 'LAN'].includes(region);

    let rankDivision = rank.replace(/[0-9]/g, '').trim();

    let isDivisionWithNumber = divisionsWithNumbers.includes(rankDivision);

    const rankInvalid = !allowedRanks.includes(rankDivision);

    if (rankInvalid) {
      return res.status(500).json({
        status: false,
        error: 'Invalid rank provided.',
      });
    }

    if (isDivisionWithNumber) {
      if (!/\d/.test(rank)) {
        return res.status(500).json({
          status: false,
          error: 'Rank number not provided',
        });
      }
    }

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

    const newUser = new User(userData);

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.uid, salt, (err, hash) => {
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
          name: newUser.name,
          notifications: [],
          friendRequests: [],
          friends: [],
        };

        const accessToken = jwt.sign(payload, KEYS.SECRET_OR_KEY, {
          expiresIn: 31556926, // 1 year in seconds
          // expiresIn: new Date(new Date()).setDate(new Date().getDate() + 30), // 30 days from now, does this work?
        });

        newUser.save();

        console.log('User created: ', newUser);
        return res.status(201).json({
          success: true,
          token: accessToken,
          user: newUser,
        });
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

// get google uid and email by using google auth firebase, then give rest of user data hosted in database.
const verifyUser = async (req, res) => {
  try {
    const { email, uid } = req.body;

    // will find the one user with the exact uid and email combination
    const foundUser = await User.findOne({ email });

    if (foundUser) {
      const isMatch = bcrypt.compare(uid, foundUser.uid); // compare req.body.uid to user uid in db.
      if (isMatch) {
        const payload = {
          uid: foundUser.uid,
          email: foundUser.email,
          rank: foundUser.rank,
          _id: foundUser._id,
          region: foundUser.region,
          discord: foundUser.discord,
          adminKey: foundUser.adminKey,
          name: foundUser.name,
          notifications: foundUser.notifications,
          friendRequests: foundUser.friendRequests,
          friends: foundUser.friends,
        };

        const accessToken = jwt.sign(payload, KEYS.SECRET_OR_KEY, {
          expiresIn: 31556926, // 1 year in seconds
          // expiresIn: new Date(new Date()).setDate(new Date().getDate() + 30), // 30 days from now, does this work?
        });

        return res.status(200).json({
          success: true,
          token: accessToken,
          user: foundUser,
        });
      } else {
        return res.status(500).json({
          message: 'Invalid token',
        });
      }
    } else {
      return res.status(500).json({
        message: 'User not found!',
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { uid = null } = req.body;

  const foundUser = await User.findOne({ _id: id });

  if (!foundUser) {
    return res.status(500).json({ status: false, message: 'user not found' });
  }

  const isMatch = bcrypt.compare(uid, foundUser.uid); // compare req.body.uid to user uid in db.

  if (!isMatch) {
    return res.status(500).json({ status: false, message: 'unauthorized' });
  }

  // check for valid rank
  if (req.body.rank) {
    let rankDivision = req.body.rank.replace(/[0-9]/g, '').trim();

    let isDivisionWithNumber = divisionsWithNumbers.includes(rankDivision);

    const rankInvalid = !allowedRanks.includes(rankDivision);

    if (rankInvalid) {
      return res.status(500).json({
        status: false,
        error: 'Invalid rank provided.',
      });
    }

    if (isDivisionWithNumber) {
      if (!/\d/.test(req.body.rank)) {
        return res.status(500).json({
          status: false,
          error: 'Rank number not provided',
        });
      }
    }
  }

  // check for valid region
  if (req.body.region) {
    const regionInvalid = !['NA', 'OCE', 'EUW', 'EUNE', 'LAN'].includes(
      req.body.region
    );

    if (regionInvalid) {
      return res.status(500).json({
        error: 'Invalid region provided.',
        status: false,
      });
    }
  }

  if (isMatch) {
    const payload = {
      uid: foundUser.uid,
      email: foundUser.email,
      _id: foundUser._id,
      rank: req.body.rank ?? foundUser.rank,
      region: req.body.region ?? foundUser.region,
      discord: req.body.discord ?? foundUser.discord,
      adminKey: req.body.adminKey ?? foundUser.adminKey,
      name: req.body.name ?? foundUser.name,

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
    };

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.uid, salt, async (err, hash) => {
        if (err) throw err;

        req.body.uid = hash;

        const accessToken = jwt.sign(payload, KEYS.SECRET_OR_KEY, {
          expiresIn: 31556926, // 1 year in seconds
          // expiresIn: new Date(new Date()).setDate(new Date().getDate() + 30), // 30 days from now, does this work?
        });

        await User.findByIdAndUpdate(
          id,
          req.body,
          { new: true },
          (error, user) => {
            if (error) {
              return res.status(500).json({ error: error.message });
            }

            if (!user) {
              return res.status(404).json(user);
            }

            return res.status(201).json({
              success: true,
              token: accessToken,
              user,
            });
          }
        );
      });
    });
  } else {
    return res.status(500).json({
      success: false,
    });
  }
};

module.exports = {
  loginUser,
  registerUser,
  verifyUser,
  updateUser,
};
