const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('assignments/index');
});

router.get('/new', (req, res) => {
    res.render('assignments/new');
});

module.exports = router;