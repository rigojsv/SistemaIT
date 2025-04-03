const express = require('express');
const router = express.Router();
const { validatesession, ValidateSessionadmin } = require('../auth/auth');

router.get('/', ValidateSessionadmin, (req, res) => {
    res.render('assignments/index', {
        auth: req.isAuthenticated(),
        user: req.user
    });
});

router.get('/new', ValidateSessionadmin, (req, res) => {
    res.render('assignments/new', {
        auth: req.isAuthenticated(),
        user: req.user
    });
});

module.exports = router;