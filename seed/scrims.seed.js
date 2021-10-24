// models
const Scrim = require('../models/scrim.model');
const User = require('../models/user.model');

// utils
const { MONGODB_URI } = require('../utils/constants');
const mongooseConnect = require('../db/connection');
const generatePassword = require('../utils/generatePassword');

// seed users first before running this
const main = async () => {
  let users = await User.find();

  if (users.length <= 0) {
    return console.error(
      'Error: no users found, please seed or create users first.'
    );
  }

  const firstFivePlayers = [...users].slice(0, 5);
  const secondFivePlayers = [...users].slice(-5);

  const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const teamOne = firstFivePlayers.map((user, idx) => ({
    role: roles[idx],
    team: { name: 'teamOne' },
    _user: user._id,
  }));

  const teamTwo = secondFivePlayers.map((user, idx) => ({
    role: roles[idx],
    team: { name: 'teamTwo' },
    _user: user._id,
  }));

  let today = new Date();

  let scrim1 = new Scrim({
    createdBy: users[0],
    teamOne,
    teamTwo,
    casters: [],
    lobbyHost: users[2],
    lobbyPassword: generatePassword(),
    gameStartTime: Date.now(),
    title: `${users[0].name}'s scrim`,
    lobbyName: 'Scrim 1 Custom Game (NA)',
    lobbyHost: users[0],
    teamWon: 'teamTwo',
  });

  let scrim2 = new Scrim({
    createdBy: users[2],
    teamOne: teamTwo,
    teamTwo: teamOne,
    lobbyHost: users[4],
    casters: [],
    lobbyPassword: generatePassword(),
    gameStartTime: new Date(today.setHours(today.getHours() + 1)).toISOString(), // 1 hour from seed time
    title: `${users[2].name}'s scrim`,
    lobbyName: 'Scrim 2 Custom Game (NA)',
    lobbyHost: users[2],
    teamWon: null,
  });

  let scrim3 = new Scrim({
    createdBy: users[0],
    teamOne,
    teamTwo,
    casters: [],
    lobbyHost: users[2],
    lobbyPassword: generatePassword(),
    gameStartTime: Date.now(),
    title: `${users[3].name}'s scrim`,
    lobbyName: 'Scrim 3 Custom Game (NA)',
    lobbyHost: users[1],
    teamWon: null,
  });

  let scrim4 = new Scrim({
    createdBy: users[0],
    teamOne: teamTwo,
    teamTwo: teamOne,
    casters: [],
    lobbyHost: users[2],
    lobbyPassword: generatePassword(),
    gameStartTime: Date.now(),
    title: `${users[3].name}'s scrim`,
    lobbyName: 'Scrim 4 Custom Game (NA)',
    lobbyHost: users[1],
    teamWon: null,
  });

  let scrim5 = new Scrim({
    createdBy: users[0],
    teamOne,
    teamTwo,
    casters: [],
    lobbyHost: users[2],
    lobbyPassword: generatePassword(),
    gameStartTime: Date.now(),
    title: `${users[0].name}'s scrim`,
    lobbyName: 'Scrim 1 Custom Game (NA)',
    lobbyHost: users[0],
    teamWon: 'teamOne',
  });

  let scrims = [scrim1, scrim2, scrim3, scrim4, scrim5];

  await Scrim.insertMany(scrims);

  console.log(`seeded ${scrims.length} scrims!`);
};

const run = async () => {
  let connection = mongooseConnect.dbConnect(MONGODB_URI);
  connection.once('open', () =>
    console.log('running mongoose to seed files on ' + MONGODB_URI)
  );
  connection.on('error', (error) => done(error));

  await main();

  await connection.close();
};

run();
