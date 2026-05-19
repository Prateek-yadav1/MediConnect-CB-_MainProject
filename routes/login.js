const path=require('path')
const express=require('express')
const router=express.Router();
const loginController=require('../controllers/login')
const mypassport=require('../auth/passport');
const { isLoggedIn } = require('../middlewares/auth');  



router.get('/',loginController.getLogin)

router.post('/', (req, res, next) => {
  mypassport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { 
      req.flash('msg', info.message || 'Login failed. Please check your credentials.');
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return loginController.postLogin(req, res);
    });
  })(req, res, next);
});
 
router.get('/google',
  mypassport.authenticate('google', { scope: ['email'] }));

router.get('/auth/google/callback', 
  mypassport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });

module.exports=router;
