function validatesession(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash('Error', 'No autorizado.');
      res.redirect('/login');
    }
  }

function ValidateSessionadmin(req, res, next) {
    if (req.isAuthenticated()) {
        if(req.user.rol == 'admin'){
        return next();
        }
    }
    req.flash('Error', 'No autorizado.');
    res.redirect('/');
}

function ValidateSessiontec(req, res, next) {
    if (req.isAuthenticated()) {
        if(req.user.rol == 'tecnico'){
        return next();
        }
    }
    req.flash('Error', 'No autorizado.');
    res.redirect('/');
}

module.exports = {
    validatesession,
    ValidateSessionadmin,
    ValidateSessiontec
}