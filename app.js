const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
require('dotenv').config();



const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}));
app.use(passport.authenticate('session'));
app.use(flash());

// EJS setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());


// Routes
app.use('/', require('./routes/index'));
app.use('/equipment', require('./routes/equipment'));
app.use('/assignments', require('./routes/assignments'));
app.use('/repairs', require('./routes/repairs'));
app.use('/reports', require('./routes/reports'));

app.listen(process.env.PORT, process.env.IP, () => {
  console.log(`Server running on: http://${process.env.IP}:${process.env.PORT}`);
});