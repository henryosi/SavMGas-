var express = require('express');
var request = require('request');
var router = express.Router();

var g_usersCtrl = require('../controllers/g_users');

/* GET users listing. */
router.get('/share', g_usersCtrl.share);
router.post('/experience', g_usersCtrl.shareExperience);
router.get('/index', g_usersCtrl.index);
router.post('/signUp', isLoggedIn, g_usersCtrl.signUp);
router.put('/updateUserLocation',g_usersCtrl.updateUserLocation);
router.get('/checkFCM', g_usersCtrl.updateUserLocation);
router.delete('/experience/:id', g_usersCtrl.removeExperience);
// router.delete('/pickoups/:id', g_usersCtrl.checkFCM);

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/google');
}

module.exports = router;