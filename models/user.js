const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// not currently used.
const User = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rank: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = User = mongoose.model('users', User);
