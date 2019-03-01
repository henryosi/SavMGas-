var request = require('request');

var G_User = require('../models/g_user');
var Driver = require('../models/driver');
var Client = require('../models/client');
var Ride = require('../models/ride');

module.exports = {
    share,
    shareExperience,
    removeExperience,
    index,
    signUp,
    updateUserLocation,
    checkFCM,
    // rejectPickup
};


function share(req, res, next) {
    console.log(req.query)
    // Make the query object to use with Student.find based up
    // the user has submitted the search form or now
    let modelQuery = req.query.name ? {name: new RegExp(req.query.name, 'i')} : {};
    // Default to sorting by name
    let sortKey = req.query.sort || 'name';
    G_User.find(modelQuery)
    .sort(sortKey).exec(function(err, g_users) {
      if (err) return next(err);
      // Passing search values, name & sortKey, for use in the EJS
      res.render('g_users/ninjas', {
        g_users,
        user: req.user,
        name: req.query.name,
        sortKey
      });
    });
  }
  
  function shareExperience(req, res, next) {
    req.user.experience.push(req.body);
    req.user.save(function(err) {
      res.redirect('/g_users/index');
    });
  }
  
  function removeExperience(req, res, next) {
    G_User.findOne({'experience._id': req.params.id}, function(err, g_user) {
      g_user.experience.id(req.params.id).remove();
      g_user.save(function(err) {
        res.redirect('/g_users/index');
      });
    });
  }
  

function index (req, res){
    let modelQuery = req.query.name ? {name: new RegExp(req.query.name, 'i')} : {};
  G_User.findOne(modelQuery).exec(function(err, g_user) {
    if (err) return next(err);
    // Passing search values, name & for use in the EJS
    console.log(g_user)
    res.render('g_users/index',{
      g_user,
      user: req.user,
      name: req.query.name
    });
  });
}

function signUp (req, res){

    var data = {
        personalData: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'G_User'
        },
        reg_id: req.header('reg_id'),
        type: req.header('type')
    };

    var g_user = new G_User(data);//double check if model conflicts with function

    g_user.save(function(err, a) {
        if(err) {
            res.json({
                valid: false,
                message: "wrong data"
            });
        }
        else {
            if(req.header ("type") == 'client'){
                var data_client ={
                    personalData: a._id, // check how to combine google sign in & new data
                    currentLocation: [
                         req.header("lat"),
                         req.header("lng")
                    ]
                };
                var client = new Client(data_client);
                client.save(function(err, c){
                    if(err){
                        res.json({
                            valid: false,
                            message: "error in client registration"
                        });
                    }
                    else {
                        res.json({
                            valid: true,
                            message: "",
                            client_id: c._id // check how to combine google sign in & new data
                        });
                    }
                });
            }
            else if (req.header ("type") == 'driver'){
                var data_driver ={
                    personalData: a._id,
                    currentLocation: [
                        req.header("lat"),
                        req.header("lng")
                    ],
                    car:{
                        color: req.header("color"),
                        carNumber: req.header("carNumber"),
                        model: req.header("model")
                    },
                    avatar: req.header("avatar"),// this maybe a duplicate or may be added here if not with g_login
                    status: "available"
                };

                var driver = new Driver(data_driver);
                driver.save(function(err, d){
                    if(err){
                        res.json({
                            valid: false,
                            message: "error in driver registration"
                        });
                    }
                    else{
                        res.json({
                            driver_id: d._id,
                            valid: true,
                            message: ""
                        });
                    }
                });
            }
            else {
                res.json({
                    valid: false,
                    message: "Not valid operation"
                });
            }
        }
    });
};

function updateUserLocation(req, res){
    var userType = req.header("type");
    var r = "100000";
    if(userType == "driver") {
        var driverID = req.header("driver_id");
        Driver.findById(driverID, function (err, driver) {
            if(err) {
                res.json({
                    valid: false,
                    message: "Not found"
                });
            }
            else {
                driver.currentLocation = [
                    req.header("lat"),
                    req.header("lng")
                ];
                driver.save(function (err, d) {
                    if(err) {
                        res.json({
                            valid: false,
                            message: "not valid location"
                        });
                    }
                   else {
                        if (d.status == "available"){
                            // use GCM clients within range
                            Client.find({currentLocation : {$geoWithin: {$centerSphere:[
                                    [Number(driver.currentLocation[0]), Number(driver.currentLocation[1])],
                                    Number(r)
                                ]}}
                                },
                                'reg_id', function(err, clients){
                                    //loop on clients
                                    var clientsList =[];
                                    for( client in clients){
                                        clientsList.push(client);
                                    }
                                    request(
                                        {
                                            "method": 'POST',
                                            "uri": 'https://android.googleapis.com/gcm/send',
                                            "headers": {
                                                'Content-Type': 'application/json',
                                                'Authorization': 'key=AIzaSyBr6_kLRRLByjUJPE1kH83fmGhN5uA0KjY' // get auth
                                            },
                                            "body": JSON.stringify(
                                                {
                                                    "registration_ids": clientsList,
                                                    "data": {
                                                        "to": "client",
                                                        "lat": d.currentLocation[0],
                                                        "lng": d.currentLocation[1],
                                                        "driver_id": d._id
                                                    },
                                                    "collapse_key ": "driver"
                                                }
                                            )
                                        }
                                        , function (error, response, body) {
                                            if(error){
                                                res.json({
                                                    valid: false,
                                                    message: "ERROR"
                                                });
                                            }
                                            else {
                                                res.json({
                                                    valid: true,
                                                    driverId: d._id,
                                                    message: ""
                                                });
                                            }

                                        }
                                    )
                                }
                            )
                        }
                        else if (d.status == "busy"){
                            // use GCM client on ride
                            Ride.find({driver: d._id}, function(err, rides) {
                                if(err) {
                                    res.json({valid: false, message: "driver has no ride"});
                                }
                                if(rides.length == 1) {
                                    request(
                                        {
                                            method: 'POST',
                                            uri: 'https://android.googleapis.com/gcm/send',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': 'key=AIzaSyBr6_kLRRLByjUJPE1kH83fmGhN5uA0KjY'
                                            },
                                            body: JSON.stringify({
                                                    "registration_ids": rides.client,
                                                    "data": {
                                                        "lat": d.currentLocation[0],
                                                        "lng": d.currentLocation[1],
                                                        "driver_id": d._id
                                                    },
                                                    "collapse_key ": "driver"
                                                }
                                            )
                                        }
                                        , function (error, response, body) {
                                            if(error){
                                                res.json({
                                                    valid: false,
                                                    message: "ERROR"
                                                });
                                            }
                                            else {
                                                res.json({
                                                    valid: true,
                                                    driverId: d._id,
                                                    message: ""
                                                });
                                            }

                                        }
                                    )
                                }
                                else {
                                    res.json(
                                        {
                                            valid: false,
                                            message: "error"
                                        });
                                }
                            });
                        }
                        else if (d. status == "outService"){
                            res.json({
                                valid: true,
                                message: ""
                            });
                        }
                        else {
                            res.json({
                                valid: false,
                                message: "Not a valid driver status"
                            });
                        }
                    }
                });
            }
        });
    }
    else if(userType == "client") {
        var clientID = req.header('client_id');
        Client.findById(clientID, function (err, client) {
            if(err) {
                res.json({
                    valid: false,
                    message: "Not valid access"
                });
            }
            else {
                client.currentLocation = [
                    req.header('lat'),
                    req.header('lng')
                ];
                client.save(function (err, c) {
                    if(err) {
                        res.json({
                            valid: false,
                            message: "Can not update the location"
                        });
                    }
                    else {
                        res.json({
                            valid: true,
                            client_id: c._id,
                            message: ""
                        });
                    }
                });
            }
        });
    }
    else {
        res.json({
            valid: false,
            message: "wrong access"
        });
    }
};

function checkFCM (req, res) {
    request({
            "uri": "https://gcm-http.googleapis.com/gcm/send",
            "method": "POST",
            "headers": { //We can define headers too
                'Content-Type': 'application/json',
                'Authorization': 'key=AIzaSyBr6_kLRRLByjUJPE1kH83fmGhN5uA0KjY'
            },
            "body": JSON.stringify({
                "registration_ids": ["eXDwSUG7ZQ8:APA91bHY_VKzBLBAr28SmP5gjtHoKS--9xsg_cVHBcwDFhExDirEP81AxUMkmL9p9hrSIF2t_O4LOukEvOfI9AFkKVLjGSllkewXpH-MgxHTexyly9JCbZGXbjineAnNKeg0Xw36PIpy"],
                "collapse_key ": "Henry",
                "data": {
                    "title": "updateLocation",
                    "driver_location_data": {
                        "driver_id": "Henry E",
                        "driver_data": {
                            "Trying": "to make this happen"
                        }
                    },
                    "driver_notification": {
                        "data": "Henry OE"
                    }
                }
            })
        }
        , function (error, response, body) {
            console.log(error);
            if(error) {
                res.json({
                    err: error,
                    res: response
                });
            }
            else {
                res.json({
                    Henry: "E",
                    res: response,
                    b: body
                });
            }
        }
    );
};
// function rejectPickup (req, res, next){
//     G_User.findOne({'pickups._id': req.params.id}, function(err, g_user){
//         g_user.pickup.id(req.params.id).remove();
//         g_user.save(function(err){
//             res.redirect('/g_users');
//         });
//     });
    
// }
        // function acceptPickup (req, res, next){
        //     var userType = req.header('type');
        
        //     req.user.pickup.push(req.body);
        //     req.user.save(function(err){
        //         res.redirect('/g_users');
        //     }); 
        // }

