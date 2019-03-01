var express = require('express');
var request = require('request');
var router = express.Router();
var passport = require('passport');
const G_User = require('../models/g_user');

// /* GET home page. */
// router.get('/', function(req, res) {
//   // res.render('index');
//   // let modelQuery = res.query.name? {name: new RegExp(req.query.name, 'i')} : {};

//   console.log(req.user, '1');
//   console.log(req.query.name, '2');
//   console.log(modelQuery, '3');
//   Driver.find(modelQuery);
//    res.render('index', {drivers, user: req.user, name: req.query.name,});   
// });

router.get('/', function(req, res, next) {
  // Make the query object to use with Driver.find based up
  // the user has submitted the search form or now
  let modelQuery = req.query.name ? {name: new RegExp(req.query.name, 'i')} : {};
  G_User.find(modelQuery).exec(function(err, g_user) {
    if (err) return next(err);
    // Passing search values, name & sortKey, for use in the EJS
    res.render('index', {
      g_user,
      user: req.user,
      name: req.query.name,
    });
  });
});

router.get('/auth/google', passport.authenticate(
  'google',
  {scope:['profile', 'email']}
));

router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    successRedirect: '/g_users/index',
    failureRedirect: '/'
  }
));

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;
