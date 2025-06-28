const Users=require('../models/user');

module.exports.getLogin=(req,res)=>{
    
    res.render('login',{msg:req.flash('msg')});
}
