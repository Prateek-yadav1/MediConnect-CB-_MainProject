const path=require('path')
const express=require('express')

module.exports.getHomePage = (req,res,next)=>{
    res.render('home');
}
