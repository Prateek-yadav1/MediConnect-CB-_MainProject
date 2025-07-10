const Users=require('../models/user');

module.exports.getLogin=(req,res)=>{
    
    res.render('login',{msg:req.flash('msg')});
}

module.exports.postLogin= function(req, res) {
    if (req.user.role === 'doctor') {
      res.redirect('/doctor/dashboard'); // Doctor's dashboard
    } else if (req.user.role === 'admin') {
      res.redirect('/admin/dashboard'); // Admin dashboard
    } else {
      res.redirect('/home'); 
    }
  }

  