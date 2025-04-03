const express = require('express');
const router = express.Router();
const passport = require('../auth/passport-config');
const { validatesession, ValidateSessionadmin } = require('../auth/auth');
const conn = require('../db/connection');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.redirect('/dashboard');
});

router.get('/login', (req, res) => {
    res.render('login/index', {
        auth: req.isAuthenticated()
    });
})

router.post('/login',
    passport.authenticate('local',{ successRedirect: '/dashboard', failureRedirect: '/login', failureMessage: true }),
    function (req, res) {
    });

router.get('/register', ValidateSessionadmin, (req, res) => {
    res.render('register/index', {
        auth: req.isAuthenticated()
    });
});

router.post('/register', ValidateSessionadmin, (req, res) => {
    const {name, email, role, password} = req.body;
    if (!name || !email || !role || !password) {
        return {message: 'No puedes dejar campos vacios'};
    } else {
        const hashedPassword = bcrypt.hashSync(password, 12);
        conn.query('INSERT INTO usuarios (nombre, correo, rol, contraseña) VALUES (?, ?, ?, ?)', [name, email, role, hashedPassword], (err, result) => {
            if (err) {
                console.log(err);
                return {message: 'Error al registrar el usuario'};
            }
            
        });
    }
})

router.get('/signout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

router.get('/dashboard', validatesession, (req, res) => {
    res.render('dashboard/index', {
        auth: req.isAuthenticated(),
        user: req.user
    });
});

module.exports = router;