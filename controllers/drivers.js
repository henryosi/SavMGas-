var request = require('request');

const Driver = require('../models/driver');
const G_User = require('../models/g_user');

module.exports = {
    updateDriverStatus,
    getDriverData
};

function updateDriverStatus(req, res) {
    var driverId = req.header('driver_id');
    var status = req.header('status');

    Driver.findById(driverId, function (err, driver) {
        if(err) {
            res.json({
                valid: false,
                message: "not found"
            });
        }
        else {
            driver.status = status;
            driver.save(function (err, d) {
                if(err) {
                    res.json({
                        valid: false,
                        message: "could not change status"
                    });
                }
                else {
                    res.json({
                        valid: true,
                        message: "",
                        driver_id: d._id
                    });
                }
            });
        }
    });
};

function getDriverData(req, res, next) {

    var driverId = req.header('driver_id');
    Driver.findById(driverId, function (err, driver) {
        if(err) {
            res.json({
                valid: false,
                message: "not valid ID"
            });
        }
        else {
            G_User.findById(driver.personalData, function (err, g_user) {
                if(err) {
                    res.json({
                        valid: false,
                        message: "wrong operation"
                    });
                }
                else {
                    res.json({
                        valid: true,
                        user_data: g_user,
                        driver_data: driver,
                        message: ""
                    });
                }
            });
        }
    });
};