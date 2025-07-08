// I will create all the strategies in this file
//the strategies like : local,facebook,google etc

const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('../models/user');
const user = require('../models/user');
const GoogleStrategy=require('passport-google-oauth20').Strategy;

//for local strategies

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async function(email, password, done) {
    try {
      let user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));
//google

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_SECRETKEY,
    callbackURL: "http://localhost:1001/login/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try{
      let user=await User.findOne({
        googleId:profile.id
      })
      if(user)
        return cb(null,user);
      user=await User.create({
        googleAccessToken:accessToken,
        googleId:profile.id
      });
      cb(null,user);

    }
    catch(err){
      cb(err,false);
    }
  }
));

passport.serializeUser(function(user,done){
    done(null,user.id);
})
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports=passport;