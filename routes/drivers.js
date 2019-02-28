var express = require('express');
var request = require('request');
var router = express.Router();

var driversCtrl = require('../controllers/drivers');

router.put('/updateDriverStatus', driversCtrl.updateDriverStatus);
router.get('/getDriverData', driversCtrl.getDriverData);

module.exports = router;