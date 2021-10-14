const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Notification = new Schema(
  {
    message: {
      type: 'String',
      required: true,
    },

    _relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

const FriendRequest = new Schema(
  {
    _user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

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
    notifications: { type: [Notification] },
    friendRequests: { type: [FriendRequest] },
    profileBackgroundImg: { type: String, default: 'Summoners Rift' },
    profileBackgroundBlur: { type: String, default: '20' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', User, 'users');
