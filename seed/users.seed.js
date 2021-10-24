const User = require('../models/user.model');

// utils
const faker = require('faker');
const sample = require('../utils/sample');
const mongooseConnect = require('../db/connection');
const { uuid: makeUuid } = require('uuidv4');
const { MONGODB_URI } = require('../utils/constants');

const main = async () => {
  const ranks = [
    'Diamond 2',
    'Platinum 1',
    'Platinum 4',
    'Grandmaster',
    'Challenger',
    'Gold 3',
    'Silver 3',
    'Bronze 1',
    'Gold 2',
    'Master',
  ];

  let users = new Array(10).fill().map((_user, idx) => {
    let name = faker.name.firstName();

    return {
      name: name,
      rank: sample(ranks),
      discord: `${name}#1${idx}3`,
      email: faker.internet.email(name),
      region: 'NA',
      uid: makeUuid(),
    };
  });

  await User.insertMany(users);

  console.log(`seeded ${users.length} users!`);
  return;
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

module.exports = run;
