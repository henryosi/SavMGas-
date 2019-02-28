var mongoose = require('mongoose');
var G_UserSchema = require('./g_user');

var clientSchema = mongoose.Schema({
    personalData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'G_User'
    },
    currentLocation: { // last updated location
        type: [Number],
        index: '2d'
    }
});

var client = mongoose.model('Client', clientSchema);
module.exports = client;