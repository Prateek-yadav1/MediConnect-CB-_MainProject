const path=require('path')
const express=require('express')
const router=express.Router();
const signupController=require('../controllers/signup')


router.get('/',(req,res,next)=>{
    res.render('home');
})




module.exports=router;