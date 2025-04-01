const express = require('express');
const router = express.Router();
const passport = require('../auth/passport-config');
const { validatesession } = require('../auth/auth');
require('../auth/auth');

router.get('/', (req, res) => {
    res.redirect('/dashboard');
});

router.get('/login', (req, res) => {
    res.render('login/index');
})

router.post('/login',
    passport.authenticate('local',{ successRedirect: '/dashboard', failureRedirect: '/login', failureMessage: true }),
    function (req, res) {
    });

router.get('/dashboard', (req, res) => {
    res.render('dashboard/index');
});

module.exports = router;