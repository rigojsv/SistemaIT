const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const conn = require('../db/connection');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function verify(email, password, cb) {
    conn.query('SELECT * FROM usuarios WHERE correo = ?', [email], function (err, user) {
        if (err) { return cb(err); }
        if (!user.length) { return cb(null, false, { message: 'Correo o contraseña incorrecto.' }); }
        
        bcrypt.compare(password, user[0].contraseña, function (err, result) {
            if (err) { return cb(err); }
            if (!result) {return cb(null, false, { message: 'Correo o contraseña incorrecto.' }); }
            return cb(null, user[0]);
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id_usuario);
});

passport.deserializeUser(function(id, done) {
    conn.query("SELECT * FROM usuarios WHERE id_usuario = ?", [id], function(err,user){	
        done(err, user[0]);
    });
});


module.exports = passport;


