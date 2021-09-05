const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema(
  {
    name: {
      // LoL summoner name
      type: String,
      required: true,
    },
    discord: { type: String, required: true, unique: true },
    rank: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    adminKey: { type: String, default: '' },
    uid: { type: String, required: true, unique: true }, // google id
    email: { type: String, required: true, unique: true }, // google email.
    // refreshToken: { type: String, required: true }, // refreshtoken provided by gmail, prob don't need.
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', User, 'users');
