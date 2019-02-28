var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var G_User = require('../models/g_user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
},
function(accessToken, refreshToken, profile, cb){
    //a user has logged in with OAuth...
    G_User.findOne({ 'googleId': profile.id}, function(err, g_user) {
        if (err) return cb(err);
        if (g_user) {
            return cb(null, g_user);
        }else{
            //we have a new driver via OAuth!
            var newG_User = new G_User({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id
            }); 
            newG_User.save(function (err){
                if (err) return(err);
                return cb(null, newG_User);
            })
        }
    })
}
));

passport.serializeUser(function(g_user, done) {
    done(null, g_user.id);
});

passport.deserializeUser(function(id, done){
    G_User.findById(id, function(err,g_user){
        done(err, g_user);
    });
});