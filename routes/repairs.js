const express = require('express');
const router = express.Router();
const { validatesession, ValidateSessionadmin } = require('../auth/auth');

router.get('/', ValidateSessionadmin, (req, res) => {
    res.render('repairs/index', {
        auth: req.isAuthenticated(),
        user: req.user
    });
});

router.get('/new', ValidateSessionadmin, (req, res) => {
    res.render('repairs/new', {
        auth: req.isAuthenticated(),
        user: req.user
    });
});

router.get('/:id', ValidateSessionadmin, (req, res) => {
    res.render('repairs/detail', {
        auth: req.isAuthenticated(),
        user: req.user
    });
});

module.exports = router;