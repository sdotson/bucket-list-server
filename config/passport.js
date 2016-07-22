const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');
const config = require('../config/main');

// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.secret
  };
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({_id: jwt_payload._id}, function(err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  }));
};
