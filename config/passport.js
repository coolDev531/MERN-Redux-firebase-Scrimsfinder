const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user.model');
const KEYS = require('../config/keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = KEYS.SECRET_OR_KEY;

/* this might be a bit overkill
 but the only reason for passport is because even though users are signing up with firebase:
 I am storing the uid and email in the database,
 google said something about using the uid to compare and verify the user in your own database.
 So I'm hashing it.

 CHECK THIS: https://firebase.google.com/docs/auth/admin/verify-id-tokens#node.js
 */

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findOne({ uid: jwt_payload.uid })
        .then((user) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch((err) => console.log(err));
    })
  );
};
