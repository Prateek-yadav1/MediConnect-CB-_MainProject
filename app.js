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

const hbs = require('hbs');
hbs.registerPartials(path.join(__dirname, 'views/partials'));

app.set('view engine','hbs');
app.use(express.urlencoded({extended:true}));
const passport = require('passport');
require('./auth/passport'); //make sure this sets up our strategies

app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(session({
    secret:process.env.SECRET_KEY,
    resave:false,
    saveUninitialized:true,
    cookie:{secure: false},
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
app.get('/test-user', (req, res) => {
  res.json(req.user); // Should show the logged-in user object
});


// Home page: fetch and show doctors
app.get('/home', async (req, res) => {
  const q = req.query.q;
  let doctors;
  if (q) {
    doctors = await Doctor.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { specialty: { $regex: q, $options: 'i' } }
      ]
    });
  } else {
    doctors = await Doctor.find({});
  }
  res.render('home', { doctors, q });
});


// Add doctor routes
app.use('/doctor', doctorRoutes);

app.use('/signup',require('./routes/signup'))
app.use('/login',require('./routes/login'))
app.use('/home',require('./routes/home'))

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

// Register 'times' helper
hbs.registerHelper('times', function(n, block) {
  let accum = '';
  for(let i = 0; i < n; ++i)
    accum += block.fn(i);
  return accum;
});

// Register 'subtract' helper if you use it
hbs.registerHelper('subtract', function(a, b) {
  return a - b;
});
mongoose.connect(process.env.DB_PATH)
.then(()=>{

app.listen(PORT,()=>{
    console.log('http://localhost:'+PORT);
})

})


 



