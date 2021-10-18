// models
const Scrim = require('../models/scrim.model');
const Conversation = require('../models/conversation.model');

// utils
const { MONGODB_URI } = require('../utils/constants');
const mongooseConnect = require('../db/connection');

// run this when deploying to live and previous scrims don't have conversations related to them.
const main = async () => {
  let scrims = await Scrim.find();

  for (let i = 0, l = scrims.length; i < l; i++) {
    let scrim = scrims[i];

    const scrimConversation = new Conversation({
      members: [],
      _scrim: scrim._id,
    });

    let savedConversation = await scrimConversation.save();

    scrim._conversation = savedConversation;

    await scrim.save();
  }

  console.log(`updated ${scrims.length} scrims!`);
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
