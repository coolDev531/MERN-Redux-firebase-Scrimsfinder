const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Friend, FriendRequest } = require('./friend.model');
const Notification = require('./notification.model');

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

    // when is the last time they signed in?
    lastLoggedIn: { type: Date },

    isDonator: { type: Boolean, default: false }, // is this user a donator?

    // list all the donations of that user
    donations: {
      type: [
        {
          date: {
            type: Date,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', User, 'users');
