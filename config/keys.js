require('dotenv').config();

const KEYS = {
  API_KEY: process.env.X_API_KEY,
  SECRET_OR_KEY: process.env.SECRET_OR_KEY,
  ADMIN_KEY: process.env.ADMIN_KEY,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
};

module.exports = KEYS;
