const db = require('../db/connection');
const faker = require('faker');
const Scrim = require('../models/scrim');
const setHours = require('../utils/setHours');
const sample = require('../utils/sample');
// const User = require('../models/user'); // maybe need this?

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const main = async () => {
  const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const ranks = [
    'Diamond 2',
    'Platinum 1',
    'Silver 3',
    'Bronze 1',
    'Gold 2',
    'Master',
  ];

  const teamOnePlayers = [
    {
      role: 'Top',
      team: { name: 'teamOne' }, //  using an object so it's scalable. right now it only contains name
      _user: {
        name: 'GitCat',
        rank: 'Diamond 1',
        region: 'NA',
        discord: 'Test#123',
      },
    },
    {
      team: { name: 'teamOne' },
      role: 'Jungle',
      _user: {
        rank: 'Silver 2',
        region: 'NA',
        discord: 'Test#143',
      },
    },
    {
      team: { name: 'teamOne' },
      role: 'Jungle',

      _user: {
        name: 'Azuru',
        rank: 'Platinum 2',
        region: 'NA',
        discord: 'Test#113',
      },
    },
    {
      team: { name: 'teamOne' },
      role: 'ADC',

      _user: {
        name: 'Cailtyn Bot',
        rank: 'Challenger',
        region: 'NA',
        discord: 'Test#11123',
      },
    },
    {
      team: { name: 'teamOne' },
      role: 'Support',
      _user: {
        name: 'EloInflatedYummiOTP',
        rank: 'Platinum 1',
        region: 'NA',
        discord: 'Test#222',
      },
    },
  ];

  const teamTwoPlayers = [...roles].map((role, index) => ({
    role: role,
    team: { name: 'teamTwo' },
    _user: {
      name: faker.name.firstName(),
      rank: sample(ranks),
      region: 'NA',
      discord: `${faker.name.firstName()}#1${index}3`,
    },
  }));

  const scrims = [
    {
      lobbyName: 'testScrim 1',
      teamOne: teamOnePlayers,
      teamTwo: teamTwoPlayers,
      casters: ['jimmy', 'bob'], // not an array of strings anymore, an array of objects, check models/scrim.js line 35.
      gameStartTime: setHours(new Date(), '3:00pm'),
      lobbyHost: sample([...teamOnePlayers, ...teamTwoPlayers]), // get a random person from the 2 teams to host the lobby.
      createdBy: teamOnePlayers[0]._user,
    },

    {
      lobbyName: 'testScrim 2',
      region: 'EUW',
      teamOne: teamOnePlayers,
      teamTwo: teamTwoPlayers,
      casters: ['YummiFan', 'AurelionSolNerfPls'],
      gameStartTime: setHours(new Date(), '9:15pm'),
      lobbyHost: sample([...teamOnePlayers, ...teamTwoPlayers]),
      createdBy: teamOnePlayers[3]._user,
    },
  ];

  await Scrim.insertMany(scrims);

  console.log(`seeded ${scrims.length} lobbies!`);
};

const run = async () => {
  await main();
  db.close();
};

run();
