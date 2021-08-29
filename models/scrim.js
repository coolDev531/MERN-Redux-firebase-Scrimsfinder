const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const toIsoString = require('../utils/toIsoString');

const generatePassword = () => {
  var pass = '';
  var str =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz0123456789@#$';

  for (i = 1; i <= 8; i++) {
    var char = Math.floor(Math.random() * str.length + 1);

    pass += str.charAt(char);
  }

  return pass;
};

const getThirtyMinFromNow = () => {
  let now = Date.now();
  let d1 = toIsoString(now);
  let d2 = new Date(d1);
  d2.setMinutes(new Date(d1).getMinutes() + 30);
  return d2;
};

const PlayerSchema = new Schema({
  name: { type: String, required: true },
  discord: { type: String, required: true },
  role: { type: String, required: true },
  rank: { type: String, required: true },
  region: { type: String, required: true },
  team: { name: { type: String } },
});

const Scrim = new Schema(
  {
    teamOne: { type: [PlayerSchema], default: [] },
    teamTwo: { type: [PlayerSchema], default: [] },
    // right now casters is just array of strings (user.name)s
    casters: { type: Array, default: [] },
    gameStartTime: {
      type: Date,
      default: getThirtyMinFromNow(),
      required: true,
    },
    lobbyHost: { type: Object, default: null },
    lobbyPassword: { type: String, default: generatePassword() },
    lobbyName: {
      type: String,
    },
    region: { type: String, default: 'NA', required: true },
    createdBy: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('scrims', Scrim);
