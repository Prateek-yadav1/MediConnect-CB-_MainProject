const path=require('path')
const express=require('express')
const router=express.Router();
const loginController=require('../controllers/login')
const mypassport=require('../auth/passport');
const { isLoggedIn } = require('../middlewares/auth');  



router.get('/',loginController.getLogin)

router.post('/',mypassport.authenticate('local', { failureRedirect: '/login' }),
 loginController.postLogin);
 
router.get('/google',
  mypassport.authenticate('google', { scope: ['home'] }));

router.get('/auth/google/callback', 
  mypassport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });

module.exports=router;