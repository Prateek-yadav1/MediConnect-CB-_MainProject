const express=require('express');
const app=express();
require('dotenv').config();
const flash = require('connect-flash');
const path=require('path');
const PORT=process.env.PORT || 1001;
const mongoose=require('mongoose');
const Mongostore=require('connect-mongo');
const doctorRoutes = require('./routes/doctor');
const Doctor = require('./models/doctor');
const session=require('express-session')//without this, passport will not be able to work
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');
const videoRoutes = require('./routes/video');
const hbs = require('hbs');
const passport = require('passport');




hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerPartials(path.join(__dirname, 'views/partials'));
hbs.registerHelper('times', function(n, block) {
  let accum = '';
  for(let i = 0; i < n; ++i)
    accum += block.fn(i);
  return accum;
});
hbs.registerHelper('subtract', function(a, b) {
  return a - b;
});


app.set('view engine','hbs');
app.use(express.urlencoded({extended:true}));

require('./auth/passport'); //make sure this sets up our strategies

app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(session({
    secret:process.env.SECRET_KEY,
    resave:false,
    saveUninitialized:true,
    cookie:{secure: false,
      maxAge: 1000 * 60 * 60 * 2
    },
    store:Mongostore.create({
        mongoUrl:process.env.DB_PATH
    })
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



app.get('/',(req,res)=>{
    res.redirect('/login');
})
app.get('/home', async (req, res) => {
    const { q, specialty, location, insurance, availability } = req.query;
    let filter = {};

    if (q) {
        filter.$or = [
            { name: new RegExp(q, 'i') },
            { specialty: new RegExp(q, 'i') }
        ];
    }
    if (specialty) filter.specialty = specialty; 
    if (location) filter.location = new RegExp(location, 'i');
    if (insurance) filter.insurance = insurance;
    const doctors = await Doctor.find(filter);
    
    res.render('home', {
        doctors,
        q,
        specialty,
        location,
        insurance,
        availability
    });
});



app.use('/doctor', doctorRoutes);
app.use('/signup',require('./routes/signup'))
app.use('/login',require('./routes/login'))
app.use('/home',require('./routes/home'))
app.use('/admin', adminRoutes);
app.use('/profile', profileRoutes);
app.use('/video', videoRoutes);

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});






mongoose.connect(process.env.DB_PATH)
.then(()=>{
app.listen(PORT,()=>{
    console.log('http://localhost:'+PORT);
})

})




