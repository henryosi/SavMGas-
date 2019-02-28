var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var methodOverride = require('method-override');

var indexRouter = require('./routes/index');
var driversRouter = require('./routes/drivers');
var clientsRouter = require('./routes/clients');
var g_usersRouter = require('./routes/g_users');
// const mapsRouter = require('./routes/maps');

require('dotenv').config();

var app = express();

//connect to MongoDB with mongoose
require('./config/database');
//configure Passport
require('./config/passport');


// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use(methodOverride('_method'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret:'SavMGas!',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/drivers', driversRouter); 
app.use('/clients', clientsRouter); 
app.use('/g_users', g_usersRouter); 
// app.use('/maps', mapsRouter);
// === http://localholst:3000/drivers/

// catch 404 and forward to error handler
app.use(function(req, res) {
  res.status(404).send('Cant find that!');
});
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
