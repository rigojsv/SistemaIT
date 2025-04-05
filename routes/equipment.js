const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { validatesession, ValidateSessionadmin } = require('../auth/auth');


router.get('/', ValidateSessionadmin, (req, res) => {
    const { search, type, state } = req.query;

    let query = 'SELECT * FROM equipos WHERE 1=1';
    const params = [];

    if (search) {
        query += ' AND (modelo LIKE ? OR serie LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (type) {
        query += ' AND tipo = ?';
        params.push(type);
    }

    if (state) {
        let estado = '';
        if (state === 'active') {
            estado = 'Activo';
        } else if (state === 'repair') {
            estado = 'En Reparación';
        } else if (state === 'inactive') {
            estado = 'Inactivo';
        }
        query += ' AND estado = ?';
        params.push(estado);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            req.flash('error', 'Error al obtener los equipos');
            return res.redirect('/equipment');
        }

        res.render('equipment/index', {
            equipos: results,
            search,
            type,
            state,
            auth: req.isAuthenticated(),
            user: req.user,
            messages: req.flash()
        });
    });
});

router.get('/new', ValidateSessionadmin, (req, res) => {
    res.render('equipment/new', {
        auth: req.isAuthenticated(),
        user: req.user,
        messages: req.flash()
    });
});

router.post('/new', ValidateSessionadmin, (req, res) => {
    const { type, brand, model, serial, purchaseDate } = req.body;

    if (!type || !brand || !model || !serial || !purchaseDate) {
        req.flash('error', 'Todos los campos son obligatorios');
        return res.redirect('/equipment/new');
    }

    const query = 'INSERT INTO equipos (tipo, marca, modelo, serie, fecha_adquisicion) VALUES (?, ?, ?, ?, ?)';

    db.query(
        query,
        [type, brand, model, serial, purchaseDate], 
        (err, results) => {
            if (err) {
                console.error(err);
                req.flash('error', 'Error al guardar el equipo');
                res.redirect('/equipment');
            }
            req.flash('success', 'Equipo guardado correctamente');
            res.redirect('/equipment');
        }
    );
});

module.exports = router;
