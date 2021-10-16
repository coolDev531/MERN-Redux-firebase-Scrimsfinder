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

    text: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', Message, 'messages');
