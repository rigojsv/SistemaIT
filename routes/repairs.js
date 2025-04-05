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
            user: req.user,
            messages: req.flash()
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
            tecnicos,
            messages: req.flash()
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error al cargar el formulario de nueva reparación');
        res.redirect('/repairs');
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
        req.flash('error', 'Error al guardar la solicitud de reparación');
        res.redirect('/repairs/new');
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

        if (!repair) { 
            req.flash('error', 'Reparación no encontrada');
            return res.redirect('/repairs');
        }

        res.render('repairs/edit', {
            repair,
            equipos,
            tecnicos,
            auth: req.isAuthenticated(),
            user: req.user,
            messages: req.flash()
        });

    } catch (err) {
        console.error(err);
        req.flash('error', 'Error al cargar el formulario de edición de reparación');
        res.redirect('/repairs');
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
        req.flash('error', 'Error al actualizar la reparación');
        res.redirect(`/repairs/${id}/edit`);
    }
});

module.exports = router;
