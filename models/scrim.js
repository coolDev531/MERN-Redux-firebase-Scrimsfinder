const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Scrim = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    imgURL: { type: String, required: true },
    zipcode: { type: String, required: true },
    teamOne: { type: Array, default: [] },
    teamTwo: { type: Array, default: [] },
    gameStartTime: {type: Date, required}
  },
  { timestamps: true }
);

module.exports = mongoose.model('scrims', Scrim);
