const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const toIsoString = require('../utils/toIsoString');

const getThirtyMinFromNow = () => {
  let now = Date.now();
  let d1 = toIsoString(now);
  let d2 = new Date(d1);
  d2.setMinutes(new Date(d1).getMinutes() + 30);
  return d2;
};

const ImageSchema = new Schema({
  bucket: { type: String, required: true },
  key: { type: String, required: true },
  location: { type: String, required: true },
  result: { type: Object, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // will only show up as user._id if not populated
});

const PlayerSchema = new Schema({
  role: { type: String },
  team: { name: { type: String } },

  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Scrim = new Schema(
  {
    teamOne: { type: [PlayerSchema], default: [] },
    teamTwo: { type: [PlayerSchema], default: [] },
    casters: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      min: 0,
      max: 2,
    },
    title: { type: String },
    gameStartTime: {
      type: Date,
      default: getThirtyMinFromNow(),
      required: true,
    },
    lobbyHost: { type: Object, default: null },
    lobbyPassword: { type: String, required: true },
    lobbyHost: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'User',
    },
    lobbyName: {
      type: String,
    },
    region: {
      type: String,
      default: 'NA',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    teamWon: { type: 'String', default: null },
    postGameImage: { type: ImageSchema },
  },
  { timestamps: true, optimisticConcurrency: true, versionKey: 'version' }
);

module.exports = mongoose.model('Scrim', Scrim, 'scrims');
