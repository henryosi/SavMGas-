var mongoose = require('mongoose');

var pickupSchema = new mongoose.Schema({
    text:String

});

var G_UserSchema = new mongoose.Schema({
    name: {type: String, unique: false, trim: true},
    email: {type: String, unique: true, trim: true},
    mobile: String,
    type: String,
    reg_id: String,
    avatar: String,
    googleId: String,
    pickup: [pickupSchema],

    rides: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride'
    }
});

var g_user = mongoose.model('G_User', G_UserSchema);
module.exports = g_user;