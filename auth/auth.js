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
        if(req.user.role == 'admin'){
        return next();
        }
    }
    req.flash('error_msg', 'Not authorized')
    res.redirect('/');
}

function ValidateSessiontec(req, res, next) {
    if (req.isAuthenticated()) {
        if(req.user.role == 'technician'){
        return next();
        }
    }
    req.flash('error_msg', 'Not authorized')
    res.redirect('/');
}

module.exports = {
    validatesession,
    ValidateSessionadmin,
    ValidateSessiontec
}