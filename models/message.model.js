const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = new Schema(
  {
    _conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },

    // the user id of sender
    _sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    _receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // not required because in scrim chats all users can be receivers, only for chat room between friends
    },

    text: {
      type: String,
    },

    // array of user ids
    _seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', Message, 'messages');
