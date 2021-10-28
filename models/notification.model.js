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

module.exports = Notification;
