const express = require('express');
const router = express.Router();
const passport = require('../auth/passport-config');
const { validatesession, ValidateSessionadmin } = require('../auth/auth');
const conn = require('../db/connection');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.redirect('/dashboard');
});

router.get('/login', (req, res) => {
    res.render('login/index', {
        auth: req.isAuthenticated(),
        user: req.user,
        messages: req.flash()
    });
})

router.post('/login',
    passport.authenticate('local',{ successRedirect: '/dashboard', failureRedirect: '/login', failureFlash: true }),
    function (req, res) {
    });

router.get('/register', ValidateSessionadmin, (req, res) => {
    res.render('register/index', {
        auth: req.isAuthenticated(),
        user: req.user
    });
});

router.post('/register', ValidateSessionadmin, (req, res) => {
    const {name, email, role, password} = req.body;
    if (!name || !email || !role || !password) {
        req.flash('error', 'No puedes dejar campos vacios');
        res.redirect('/register');
    } else {
        const hashedPassword = bcrypt.hashSync(password, 12);
        conn.query('INSERT INTO usuarios (nombre, correo, rol, contraseña) VALUES (?, ?, ?, ?)', [name, email, role, hashedPassword], (err, result) => {
            if (err) {
                console.log(err);
                req.flash('error', 'Error al registrar el usuario');
                res.redirect('/register');
            }
            req.flash('success', 'Usuario registrado correctamente');
            res.redirect('/register');
        });
    }
})

router.get('/config', validatesession, (req, res) => {
    res.render('config/index', {
        auth: req.isAuthenticated(),
        user: req.user,
        messages: req.flash()
    });
});

router.post('/config', validatesession, (req, res) => {
    const {name, email, password, newpassword} = req.body; 
    if (!name || !email || !password || !newpassword) {
        req.flash('error', 'No puedes dejar campos vacios');
        res.redirect('/config');
    } else { 
        conn.query('SELECT * FROM usuarios WHERE id_usuario = ?', [req.user.id_usuario], (err, user) => {
            if (err) {
                console.log(err);
                req.flash('error', 'Error al obtener el usuario');
                res.redirect('/config');
            }
            if (user.length === 0) {
                req.flash('error', 'Usuario no encontrado');
                res.redirect('/config');
            }
            const hashedPassword = bcrypt.hashSync(password, 12);
            if (hashedPassword !== user[0].contraseña) {
                req.flash('error', 'La contraseña actual es incorrecta');
                res.redirect('/config');
            } else {
                const newHashedPassword = bcrypt.hashSync(newpassword, 12);
                conn.query('UPDATE usuarios SET nombre = ?, correo = ?, contraseña = ? WHERE id_usuario = ?', [name, email, newHashedPassword, req.user.id_usuario], (err, result) => {
                    if (err) {
                        console.log(err);
                        req.flash('error', 'Error al actualizar el usuario');
                        res.redirect('/config');
                    }else {
                    req.flash('success', 'Usuario actualizado correctamente');
                    res.redirect('/config');
                    }
                });
            }
        });
    }
});

router.get('/signout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success', 'Sesión cerrada exitosamente.');
        res.redirect('/login');
    });
});

router.get('/dashboard', validatesession, (req, res) => {
    res.render('dashboard/index', {
        auth: req.isAuthenticated(),
        user: req.user
    });
});

module.exports = router;