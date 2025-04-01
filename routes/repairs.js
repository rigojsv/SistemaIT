const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('repairs/index');
});

router.get('/new', (req, res) => {
    res.render('repairs/new');
});

router.get('/:id', (req, res) => {
    res.render('repairs/detail');
});

module.exports = router;