const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Ban = new Schema(
  {
    _user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateFrom: {
      type: Date,
      default: null,
    },
    dateTo: {
      type: Date,
      default: null,
    },
    _bannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    _unbannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    isActive: {
      type: Boolean,
      default: false,
      required: true,
    },
    reason: {
      type: String,
      default: '',
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ban', Ban, 'bans');
