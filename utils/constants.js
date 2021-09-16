let MONGODB_URI =
  process.env.PROD_MONGODB || 'mongodb://127.0.0.1:27017/scrimsdatabase';

module.exports = {
  MONGODB_URI,
};
