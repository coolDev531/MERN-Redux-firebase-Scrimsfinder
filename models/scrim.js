const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Scrim = new Schema(
  {
    teamOne: { type: Array, default: [] },
    teamTwo: { type: Array, default: [] },
    casters: { type: Array, default: [] },
    gameStartTime: { type: Date, default: Date.now(), required: true },
    lobbyHost: { type: Object, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('scrims', Scrim);
