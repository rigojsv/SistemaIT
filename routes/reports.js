const express = require('express');
const router = express.Router();
const { validatesession, ValidateSessionadmin } = require('../auth/auth');

router.get('/', ValidateSessionadmin, (req, res) => {
    res.render('reports/index', {
        auth: req.isAuthenticated(),
        user: req.user
    });
});

module.exports = router;