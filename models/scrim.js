const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

const Scrim = new Schema(
  {
    teamOne: { type: Array, default: [] },
    teamTwo: { type: Array, default: [] },
    casters: { type: Array, default: [] },
    gameStartTime: { type: Date, default: Date.now(), required: true },
    lobbyHost: { type: Object, default: null },
    lobbyPassword: { type: String, default: generatePassword() },
    lobbyName: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('scrims', Scrim);
