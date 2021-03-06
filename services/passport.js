const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Create local strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
    /** Verify this email and password, call done with the user
     * if it is the correct email and password
     * otherwise, call done with false
     */
     User.findOne({ email: email }, function(err, user) {
         if (err) { return done(err); }
         if (!user) { return done(null, false); } // No err, but user not found

         // Compare passwords - is `password` === to user.password
         user.comparePassword(password, function(err, isMatch) {
            if (err) { return done(err); }
            if (!isMatch) { return done(null, false); } // No err, but no user found

            return done(null, user);
         });
     });
});

// Setup options for JWT Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.secret
};

// Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    /** See if the user ID in the payload exists in our DB
     * if it does, call 'done' with that user
     * otherwise, call done without a user object
     */
    User.findById(payload.sub, function(err, user) {
        if (err) { return done(err, false); }

        if (user) {
            done(null, user); // without an err & with that user
        } else { // if no user found
            done(null, false); // there was no err & couldn't find a user
        }
    });
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);