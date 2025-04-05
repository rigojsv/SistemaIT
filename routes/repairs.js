const express = require('express');
const router = express.Router();
const { validatesession, ValidateSessionadmin } = require('../auth/auth');
const db = require('../db/connection');


router.get('/', ValidateSessionadmin, async (req, res) => {
    try {
        const con = db.promise();
        const [repairs] = await con.query(`
            SELECT 
                r.id_reparacion,
                r.estado,
                r.descripcion_problema,
                r.fecha_ingreso,
                r.prioridad,
                e.tipo AS equipo,
                e.marca,
                e.modelo,
                u.nombre AS tecnico
            FROM reparaciones r
            JOIN equipos e ON r.id_equipo = e.id_equipo
            JOIN usuarios u ON r.id_tecnico = u.id_usuario
            ORDER BY r.fecha_ingreso DESC
        `);
        const estadoContador = {
            pendientes: repairs.filter(r => r.estado === 'En revisión').length,
            enProceso: repairs.filter(r => r.estado === 'En reparación').length,
            completadas: repairs.filter(r => r.estado === 'Reparado' || r.estado === 'Descartado').length
        };
        const [tecnicos] = await con.query(`
            SELECT id_usuario, nombre FROM usuarios WHERE rol = 'tecnico'
        `);
        res.render('repairs/index', {
            repairs,
            tecnicos,
            estadoContador,
            auth: req.isAuthenticated(),
            user: req.user
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar reparaciones');
    }
});

router.get('/new', ValidateSessionadmin, async (req, res) => {
    try {
        const [equipos] = await db.promise().query(`SELECT id_equipo, tipo, marca, modelo, serie FROM equipos`);
        const [tecnicos] = await db.promise().query(`SELECT id_usuario, nombre FROM usuarios WHERE rol = 'tecnico'`);

        res.render('repairs/new', {
            auth: req.isAuthenticated(),
            user: req.user,
            equipos,
            tecnicos
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar el formulario');
    }
});

router.post('/new', ValidateSessionadmin, async (req, res) => {
    const { id_equipo, id_tecnico, prioridad, estado, descripcion_problema } = req.body;

    try {
        await db.promise().query(`
            INSERT INTO reparaciones (id_equipo, id_tecnico, prioridad, estado, descripcion_problema)
            VALUES (?, ?, ?, ?, ?)
        `, [id_equipo, id_tecnico, prioridad, estado, descripcion_problema]);

        res.redirect('/repairs');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al guardar la solicitud');
    }
});

router.get('/:id/edit', ValidateSessionadmin, async (req, res) => {
    const { id } = req.params;
    try {
        const con = db.promise();

        const [[repair]] = await con.query(`
            SELECT * FROM reparaciones WHERE id_reparacion = ?
        `, [id]);

        const [equipos] = await con.query(`
            SELECT id_equipo, tipo, marca, modelo, serie FROM equipos
        `);

        const [tecnicos] = await con.query(`
            SELECT id_usuario, nombre FROM usuarios WHERE rol = 'tecnico'
        `);

        if (!repair) return res.status(404).send('Reparación no encontrada');

        res.render('repairs/edit', {
            repair,
            equipos,
            tecnicos,
            auth: req.isAuthenticated(),
            user: req.user
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar la reparación');
    }
});


router.post('/:id/edit', ValidateSessionadmin, async (req, res) => {
    const { id } = req.params;
    const { id_equipo, id_tecnico, prioridad, estado, descripcion_problema } = req.body;

    try {
        await db.promise().query(`
            UPDATE reparaciones
            SET id_equipo = ?, id_tecnico = ?, prioridad = ?, estado = ?, descripcion_problema = ?
            WHERE id_reparacion = ?
        `, [id_equipo, id_tecnico, prioridad, estado, descripcion_problema, id]);

        res.redirect('/repairs');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar la reparación');
    }
});

module.exports = router;
