const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Friend, FriendRequest } = require('./friend.model');

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

    _relatedScrim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scrim',
      required: false,
    },

    isFriendRequest: {
      type: Boolean,
      required: false,
    },

    isScrimAlert: {
      type: Boolean,
      required: false,
    },

    createdDate: {
      type: Date,
      default: Date.now(),
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
    isAdmin: { type: Boolean, default: false },
    uid: { type: String, required: true, unique: true }, // google id
    email: { type: String, required: true, unique: true }, // google email.
    notifications: { type: [Notification] },

    // friends
    friendRequests: { type: [FriendRequest] },
    friends: { type: [Friend] },

    // profile customization
    profileBackgroundImg: { type: String, default: 'Summoners Rift' },
    profileBackgroundBlur: { type: String, default: '20' },

    // can we send them an email?
    canSendEmailsToUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', User, 'users');
