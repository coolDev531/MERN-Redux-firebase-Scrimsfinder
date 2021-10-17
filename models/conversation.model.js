const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Conversation = new Schema(
  {
    _scrim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scrim',
      required: false,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', Conversation, 'conversations');
