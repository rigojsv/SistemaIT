const express = require('express');
const router = express.Router();
const conn = require('../db/connection');
const { ValidateSessionadmin } = require('../auth/auth');

router.get('/', ValidateSessionadmin, (req, res) => {
    const query = `
        SELECT 
    a.id_asignacion,
    u.nombre AS cliente,
    e.tipo,
    e.marca,
    e.modelo,
    a.fecha_asignacion,
    a.fecha_devolucion
FROM asignaciones a
LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
LEFT JOIN equipos e ON a.id_equipo = e.id_equipo
ORDER BY a.fecha_asignacion DESC;
    `;

    conn.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error al obtener las asignaciones');
        }

        res.render('assignments/index', {
            asignaciones: results,
            auth: req.isAuthenticated(),
            user: req.user
        });
    });
});

router.get('/new', ValidateSessionadmin, (req, res) => {
    conn.query('SELECT id_usuario, nombre FROM usuarios WHERE rol = "cliente"', (err, clientes) => {
        if (err) {
            return res.status(500).send('Error al cargar los datos para la asignación');
        }

        conn.query('SELECT id_equipo, tipo, marca, modelo FROM equipos', (err, equipos) => {
            if (err) {
                return res.status(500).send('Error al cargar los datos para la asignación');
            }

            res.render('assignments/new', {
                clientes,
                equipos,
                auth: req.isAuthenticated(),
                user: req.user
            });
        });
    });
});

router.post('/', ValidateSessionadmin, (req, res) => {
    const { id_cliente, id_equipo, fecha_asignacion, notas } = req.body;

    if (!id_cliente || !id_equipo || !fecha_asignacion) {
        return res.status(400).send('Faltan campos requeridos');
    }

    conn.query('SELECT * FROM asignaciones WHERE id_equipo = ? AND fecha_devolucion IS NULL', [id_equipo], (err, asignado) => {
        if (err) {
            return res.status(500).send('Error al verificar la asignación');
        }

        if (asignado.length > 0) {
            return res.status(400).send('El equipo ya está asignado a otro usuario');
        }

        conn.query(
            'INSERT INTO asignaciones (id_equipo, fecha_asignacion, notas, id_usuario) VALUES (?, ?, ?, ?, ?)',
            [id_equipo, fecha_asignacion, notas, id_cliente],
            (err, result) => {
                if (err) {
                    return res.status(500).send('Error al procesar la asignación');
                }

                res.redirect('/assignments');
            }
        );
    });
});

router.post('/:id/delete', ValidateSessionadmin, (req, res) => {
    const id_asignacion = req.params.id;

    const query = `
        UPDATE asignaciones
        SET id_equipo = NULL
        WHERE id_asignacion = ?
    `;

    conn.query('DELETE FROM asignaciones WHERE id_asignacion = ?', [id_asignacion], (err, result) => {
        if (err) {
            console.error('Error en la eliminación:', err);
            return res.status(500).send('Error al eliminar la asignación');
        }

        res.redirect('/assignments');
    });

});

module.exports = router;
