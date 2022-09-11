const mongoose = require('mongoose');

const LoginInfo = new mongoose.Schema(
  {
    _user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    languages: {
      type: [
        {
          name: { type: String },
          native: { type: String },
          code: { type: String },
        },
      ],
    },
    asn: {
      asn: { type: String },
      domain: { type: String },
      name: { type: String },
      route: { type: String },
      type: { type: String },
    },
    carrier: {
      mcc: { type: String },
      mnc: { type: String },
      name: { type: String },
    },
    city: { type: String },
    continent_code: { type: String },
    continent_name: { type: String },
    country_code: { type: String },
    country_name: { type: String },
    currency: {
      code: { type: String },
      name: { type: String },
      native: { type: String },
      plural: { type: String },
      symbol: { type: String },
    },
    emoji_flag: {
      type: String,
    },
    emoji_unicode: {
      type: String,
    },
    flag: {
      type: String,
    },
    ip: {
      type: String,
    },
    is_eu: {
      type: Boolean,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    postal: {
      type: String,
    },
    region: {
      type: String,
    },
    region_code: {
      type: String,
    },
    threat: {
      blocklists: {
        type: [
          {
            name: {
              type: String,
            },
            site: {
              type: String,
            },
            type: {
              type: String,
            },
          },
        ],
      },
      is_anonymous: {
        type: Boolean,
      },
      is_bogon: {
        type: Boolean,
      },
      is_datacenter: {
        type: Boolean,
      },
      is_icloud_relay: {
        type: Boolean,
      },
      is_known_abuser: {
        type: Boolean,
      },
      is_known_attacker: {
        type: Boolean,
      },
      is_proxy: {
        type: Boolean,
      },
      is_threat: {
        type: Boolean,
      },
      is_tor: {
        type: Boolean,
      },
      time_zone: {
        type: {
          abbr: {
            type: String,
          },
          current_time: {
            type: String,
          },
          is_dst: {
            type: Boolean,
          },
          name: {
            type: String,
          },
          offset: {
            type: String,
          },
        },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginInfo', LoginInfo, 'loginInfos');
