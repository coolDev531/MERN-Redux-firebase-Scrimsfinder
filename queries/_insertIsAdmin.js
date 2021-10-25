// models
const User = require('../models/user.model');
const KEYS = require('../config/keys');
// utils
const { MONGODB_URI } = require('../utils/constants');
const mongooseConnect = require('../db/connection');

// NOTE: I already ran this query, we don't have to run it again, but I'll keep it anyways.

// run this when deploying to live and previous scrims don't have conversations related to them.
const main = async () => {
  let users = await User.find();

  let usersUpdatedCount = 0;

  for (let i = 0, l = users.length; i < l; i++) {
    let user = users[i];

    if (user.isAdmin) continue;
    if (!user.adminKey || user.adminKey === '') continue;
    if (user.adminKey !== KEYS.ADMIN_KEY) continue;

    if (user.adminKey === KEYS.ADMIN_KEY) {
      user.isAdmin = true;
      await user.save();
      usersUpdatedCount++;
    }
  }

  console.log(`updated ${usersUpdatedCount} users!`);
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
