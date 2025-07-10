const path=require('path')
const express=require('express')
const router=express.Router();
const homeController=require('../controllers/home');
const { isLoggedIn } = require('../middlewares/auth');


router.get('/',homeController.getHomePage)




module.exports=router;