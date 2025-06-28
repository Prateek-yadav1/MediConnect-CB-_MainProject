// I eill create all the strategies in this file
//the strategies like : local,facebook,google etc

const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('../models/user');
const GoogleStrategy=require('passport-google-oauth20').Strategy;

//for local strategies

passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      let user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      // Plain text password check (for demo; use bcrypt in production)
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
passport.deserializeUser(function(id,done){
    User.findById(id,function(err,user){
        done(err,user)
    });
});

module.exports=passport;