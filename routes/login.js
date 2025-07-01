const path=require('path')
const express=require('express')
const router=express.Router();
const loginController=require('../controllers/login')
const mypassport=require('../auth/passport');



router.get('/',loginController.getLogin)

router.post('/',mypassport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    if (req.user.role === 'doctor') {
      res.redirect('/doctor/dashboard'); // Doctor's dashboard
    } else if (req.user.role === 'admin') {
      res.redirect('/admin/dashboard'); // Admin dashboard
    } else {
      res.redirect('/home'); 
    }
  })
router.get('/google',
  mypassport.authenticate('google', { scope: ['home'] }));

router.get('/auth/google/callback', 
  mypassport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });

module.exports=router;