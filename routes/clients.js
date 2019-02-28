var express = require('express');
var request = require('request');
var router = express.Router();

var clientsCtrl = require('../controllers/clients');

router.get('/', clientsCtrl.index);
router.get('/getNearDrivers', clientsCtrl.getNearDriver);
router.get('/getDrivers', clientsCtrl.getDriver);
router.post('/requestRide', clientsCtrl.requestRide);
router.get('/getRidesHistory',clientsCtrl.getRidesHistory);

module.exports = router;