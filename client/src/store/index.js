/* eslint-disable */
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./store.prod'); // store for prod, same as dev but without devtools and window.store
} else {
  module.exports = require('./store.dev'); // same as prod but WITH devtools and window.store
}
