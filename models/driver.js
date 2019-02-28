var mongoose = require('mongoose');
var G_UserSchema = require('./g_user');

var driverSchema = new mongoose.Schema({
    personalData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'G_User'
    },
status: {
    type: String, default: "available"
},
currentLocation: {
    type: [Number],
    index: '2d'
},
currentRide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
},
car: {
    color: String,
    carNumber: String,
    model: String
} 

});

var driver = mongoose.model('Driver', driverSchema);
module.exports = driver;