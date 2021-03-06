var mongoose = require('mongoose');

var rideSchema = new mongoose.Schema({

    client: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Client'
    },

    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver'
    },

    from: {
        type: [Number],
        index: '2d'
    },

    to: {
        type: [Number],
        index: '2d'
    },

    startTime: Number,

    endTime: Number,

    status: String,
// {on way to client, with client, delivered, canceled}
});

var ride = mongoose.model('Ride', rideSchema);
module.exports = ride;