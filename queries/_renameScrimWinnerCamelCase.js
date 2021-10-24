// models
const Scrim = require('../models/scrim.model');
const Conversation = require('../models/conversation.model');

// utils
const { MONGODB_URI } = require('../utils/constants');
const mongooseConnect = require('../db/connection');

// NOTE: I already ran this query, we don't have to run it again, but I'll keep it anyways.

// run this when deploying to live and previous scrims don't have conversations related to them.
const main = async () => {
  let scrims = await Scrim.find();

  let scrimsUpdatedCount = 0;

  for (let i = 0, l = scrims.length; i < l; i++) {
    let scrim = scrims[i];

    if (!scrim.teamWon) continue; // it doesn't have a winner, we skip this.

    if (scrim.teamWon === 'teamOne' || scrim.teamWon === 'teamTwo') continue; // it already has a camel case winner,

    scrim.teamWon =
      scrim.teamWon === 'Team 1 (Blue Side)' ? 'teamOne' : 'teamTwo'; // save to camel case convention

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
