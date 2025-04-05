const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const {ValidateSessionadmin } = require('../auth/auth');


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
            return req.flash('error', 'Error al obtener los equipos');
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
        mensages: req.flash()
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
                return req.flash('error', 'Error al guardar el equipo');
            }
            res.redirect('/equipment/new');
        }
    );
});

router.get('/:id_equipo/edit', ValidateSessionadmin, (req, res) => {
    const { id_equipo } = req.params;
    const query = 'SELECT * FROM equipos WHERE id_equipo = ?';
    db.query(query, [id_equipo], (err, results) => {
        if (err) {
            console.error(err);
            req.flash('error', 'Error al obtener el equipo');
            return res.redirect('/equipment');
        }
        if (results.length === 0) {
            req.flash('error', 'Equipo no encontrado');
            return res.redirect('/equipment');
        }
        const equipo = results[0];
        res.render('equipment/edit', { 
            equipo, 
            auth: req.isAuthenticated(), 
            user: req.user,
            messages: req.flash()
        });
    });
});


router.post('/:id_equipo/edit', ValidateSessionadmin, (req, res) => {
    const { id_equipo } = req.params;
    const { tipo, marca, modelo, serie, fecha_adquisicion } = req.body;

    if (!tipo || !marca || !modelo || !serie || !fecha_adquisicion) {
        req.flash('error', 'Todos los campos son obligatorios');
        res.redirect(`/equipment/${id_equipo}/edit`);
    }

    const query = `
        UPDATE equipos 
        SET tipo = ?, marca = ?, modelo = ?, serie = ?, fecha_adquisicion = ?
        WHERE id_equipo = ?
    `;

    db.query(query, [tipo, marca, modelo, serie, fecha_adquisicion, id_equipo], (err) => {
        if (err) { 
        req.flash('error', 'Error al actualizar el equipo');
         return res.redirect(`/equipment/${id_equipo}/edit`);
        } else {
        req.flash('success', 'Equipo actualizado correctamente');
        res.redirect('/equipment');
        }
    });
});


module.exports = router;
