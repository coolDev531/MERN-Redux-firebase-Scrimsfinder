const Scrim = require('../models/scrim.model');
// utils
const { MONGODB_URI } = require('../utils/constants');
const mongooseConnect = require('../db/connection');

// 10/28/2021
/* This query is to set all previous scrims isWithCasters to true (new attribute in db) */
const main = async () => {
  let scrims = await Scrim.find();

  let scrimsUpdatedCount = 0;

  for (let i = 0, l = scrims.length; i < l; i++) {
    let scrim = scrims[i];

    scrim.isWithCasters = true;

    await scrim.save();
    scrimsUpdatedCount++;
  }

  console.log(`updated ${scrimsUpdatedCount} scrims!`);
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
