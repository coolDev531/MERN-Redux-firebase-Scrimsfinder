const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema(
  {
    name: {
      // summoner name
      type: String,
      required: true,
    },
    discord: { type: String, required: true },
    rank: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    adminKey: { type: String, default: '' },
    uid: { type: String, required: true }, // google id
    email: { type: String, required: true, unique: true }, // google email.
  },
  { timestamps: true }
);

module.exports = mongoose.model('users', User);
