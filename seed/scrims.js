const db = require('../db/connection');
const faker = require('faker');
const Scrim = require('../models/scrim');
const setHours = require('../utils/setHours');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const main = async () => {
  const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const teamOnePlayers = [
    {
      name: 'GitCat',
      role: 'Top',
      Rank: 'Diamond I',
    },
    {
      name: 'AmumuCrying',
      role: 'Jungle',
      Rank: 'Silver 2',
    },
    {
      name: 'Azuru',
      role: 'Mid',
      Rank: 'Platinum II',
    },
    {
      name: 'Cailtyn Bot',
      role: 'ADC',
      Rank: 'Challenger',
    },
    {
      name: 'EloInflatedYummiOTP',
      role: 'Support',
      Rank: 'Platinum 1',
    },
  ];

  const teamTwoPlayers = [
    roles.map((role) => ({
      name: faker.name.firstName(),
      role: role,
    })),
  ];

  const scrims = [
    {
      teamOne: teamOnePlayers,
      teamTwo: teamTwoPlayers,
      casters: ['jimmy', 'bob'],
      gameStartTime: setHours(new Date(), '3:00pm'),
    },

    {
      teamOne: teamOnePlayers,
      teamTwo: teamTwoPlayers,
      casters: ['YummiFan', 'AurelionSolNerfPls'],
      gameStartTime: setHours(new Date(), '9:15pm'),
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
