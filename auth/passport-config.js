const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const conn = require('../db/connection');

passport.use(new LocalStrategy(function verify(username, password, cb) {
    conn.query('SELECT * FROM users WHERE username = ?', [username], function (err, user) {
        if (err) { return cb(err); }
        if (!user.length) { return cb(null, false, { message: 'Incorrect username or password.' }); }

        bcrypt.compare(password, user[0].password, function (err, result) {
            if (err) { return cb(err); }
            if (!result) {return cb(null, false, { message: 'Incorrect username or password.' }); }
            return cb(null, user[0]);
        });
    });
}));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user.id);
    });
});

passport.deserializeUser(function (id, cb) {
    conn.query('SELECT * FROM users WHERE id = ?', [id], function (err, user) {
        if (err) { return cb(err); }
        return cb(null, user[0]);
    });
});

module.exports = passport;


