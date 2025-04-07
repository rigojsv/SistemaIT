const express = require('express');
const router = express.Router();
const { validatesession, ValidateSessionadmin } = require('../auth/auth');
const conn = require('../db/connection');

router.get('/', ValidateSessionadmin, (req, res) => {

    conn.query(' SELECT u.nombre, COUNT(*) AS total FROM asignaciones a JOIN usuarios u ON u.id_usuario = a.id_usuario GROUP BY u.nombre', (err, usuarios) => {
        if (err) {
            console.error(err);
            return res.send('Error al obtener los reportes');    
        }

        conn.query('select estado, count(distinct id_equipo) as total from reparaciones group by estado;', (err, estados) => {
            if(err){
                console.error(err);
                return res.send('Error al obtener los reportes');    
            }

            conn.query("SELECT 'Asignados' AS estado, COUNT(DISTINCT e.id_equipo) AS total FROM equipos e JOIN asignaciones a ON e.id_equipo = a.id_equipo UNION SELECT 'No asignados' AS estado, COUNT(e.id_equipo) AS total FROM equipos e LEFT JOIN asignaciones a ON e.id_equipo = a.id_equipo WHERE a.id_asignacion IS NULL;", (err, asignaciones) => {
                if(err){
                    console.error(err);
                    return res.send('Error al obtener los reportes');    
                }
                res.render('reports/index', {
                    auth: req.isAuthenticated(),
                    user: req.user,
                    messages: req.flash(),
                    usuarios,
                    estados,
                    asignaciones
                });
            });
        });
    });
});

module.exports = router;