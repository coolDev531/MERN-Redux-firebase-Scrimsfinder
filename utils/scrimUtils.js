const Scrim = require('../models/scrim.model');
const User = require('../models/user.model');

const sample = require('./sample');
const KEYS = require('../config/keys');

// utils for scrims.controller.js

/**
 * @method compareArrays
    compare if the previous state of team that the player is joining is identical.
    If it is, he isn't swapping teams (will return true), if it isn't identical, he is swapping teams (will return false)
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {Boolean}
 */
const compareArrays = (arr1, arr2) => {
  // should probably be renamed to compareTeams?
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i]._id !== arr2[i]._id) return false;
  }

  // If all elements were same.
  return true;
};

/**
 * @method swapPlayer
 * move the player to a different team
 * NOT SWAPPING BETWEEN 2 PLAYERS, ONLY MOVING PLAYER TO DIFFERENT TEAM.
 * @param {Array} currentTeam
 * @param {Array} movingTeam
 * @param {Object} movingPlayer the player in the transaction
 * @returns {Array} [team the player left, team the player moved to]
 */
const swapPlayer = (currentTeam, movingTeam, movingPlayer) => {
  // remove player from currentTeam
  const indexToRemove = currentTeam.findIndex(
    (player) => String(player?._user) === String(movingPlayer?._user._id)
  );
  if (indexToRemove > -1) currentTeam.splice(indexToRemove, 1);
  // add player to the team he's moving to
  movingTeam = [...movingTeam, movingPlayer];
  return [currentTeam, movingTeam];
};

const getAvailableRoles = (team) => {
  const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
  const takenRoles = new Set();

  for (const role of roles) {
    for (const player of team) {
      if (role === player.role) {
        takenRoles.add(role);
      }
    }
  }

  return roles.filter((r) => !takenRoles.has(r)).join(', ');
};

// takes role from req.body.playerData.role and returns true or false if it matches
const isValidRole = (role) => {
  const roles = /^Top$|^Jungle$|^Mid$|^ADC$|^Support$/gi; // case insensitive
  return roles.test(role);
};

// these populate utils won't be needed if we switch to SQL.
const populateTeam = (teamName) => {
  // nested populate for mongoose so we don't just get user._ids in api call response.
  return {
    path: teamName,
    populate: {
      path: '_user',
      model: 'User',
      select: 'name discord rank region', // exclude adminKey,uid and email from showing
    },
  };
};

const populateUser = ['name', 'discord', 'region'];

// mongoose populate stuff
const populateOneScrim = async (scrimId) => {
  const scrimData = await Scrim.findById(scrimId)
    .populate('createdBy', populateUser)
    .populate('casters', populateUser)
    .populate('lobbyHost', populateUser)
    .populate(populateTeam('teamOne'))
    .populate(populateTeam('teamTwo'))
    .exec();

  return scrimData;
};

/**
 * gets the title that the admin/mod put in when created the scrim,
 * but removes characters that LoL custom lobbies don't allow
 * @method getLobbyName
 * @param {String} scrimTitle
 * @param {String} region
 * @returns {String}
 */
const getLobbyName = (scrimTitle, region) => {
  // remove emojis with this .replace
  // https://stackoverflow.com/questions/10992921/how-to-remove-emoji-code-using-javascript
  return `${scrimTitle} (${region})`.replace(
    /([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g,
    ''
  );
};

/**
 * @method getLobbyHost
 * @param {Object} scrim
 * @returns {Object} the user to be the selected random host
 */
const getLobbyHost = async (scrim) => {
  if (!scrim) {
    return console.error('Error, scrim not provided for getLobbyHost function');
  }

  const lobbyHost = scrim.lobbyHost ?? null;

  // select lobby host
  if (lobbyHost !== null) {
    //  if scrim already has a lobby host, just select it.
    return lobbyHost;
  } else if (scrim.teamOne.length === 5 && scrim.teamTwo.length === 5) {
    // if lobby is going to be full after user will join (players length = 10)
    const result = sample([...scrim.teamOne, ...scrim.teamTwo]);
    const userResult = await User.findById(result._user);
    return userResult;
  } else {
    return null;
  }
};

// these date utils not really used in the front-end application, but might be useful.
const checkIfScrimIsToday = (scrim) => {
  let now = Date.now();
  let nowDate = new Date(now).setHours(0, 0, 0, 0);

  let scrimGameDate = new Date(scrim.gameStartTime).setHours(0, 0, 0, 0);

  return nowDate === scrimGameDate;
};

const checkIfScrimIsInACertainDate = (scrim, date) => {
  let certainDate = new Date(date).setHours(0, 0, 0, 0);
  let scrimGameDay = new Date(scrim.gameStartTime).setHours(0, 0, 0, 0);

  return certainDate === scrimGameDay;
};

const onSpotTaken = async (scrim, res, spotsAvailable, teamJoiningName) => {
  const scrimData = await populateOneScrim(scrim._id);

  const teamJoiningTitle =
    teamJoiningName === 'teamOne' ? 'Team 1 (Blue Side)' : 'Team 2 (Red Side)';

  return res.status(500).json({
    error: `spot taken! spots available for ${teamJoiningTitle}: ${spotsAvailable}`,
    scrim: scrimData,
  });
};

// currentUser from jwt token, userId from request params
// this is for when joining, leaving, moving teams in a game, or when kicking a player
const checkUnauthorized = (currentUser, userId) => {
  if (!currentUser?._id) {
    return false;
  }

  // if user isn't admin or isn't himself, that means he is not authorized to do this.
  const isUnauthorized =
    userId !== currentUser._id && currentUser.adminKey !== KEYS.ADMIN_KEY;

  return isUnauthorized;
};

module.exports = {
  compareArrays,
  isValidRole,
  getAvailableRoles,
  populateTeam,
  populateUser,
  getLobbyName,
  swapPlayer,
  compareArrays,
  getLobbyHost,
  checkIfScrimIsInACertainDate,
  checkIfScrimIsToday,
  populateOneScrim,
  onSpotTaken,
  checkUnauthorized,
};
