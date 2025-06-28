const Users=require('../models/user');



module.exports.getSignup = (req,res)=>{
    res.render('signup',{
        msg:req.flash('msg')
    });
}

module.exports.postSignup = async (req,res,next)=>{
    const {username,password}=req.body;
try{
    let user= await Users.findOne({username})
    if(!user){
        try{
            user= await Users.create({username,password});
             req.session.username=username;

req.flash('msg','You have successfully signed up');
   return res.redirect('/login');

        }
   catch{
    req.flash('msg','Signup not successfull, try again!');
   return res.redirect('/signup');

   }
}
else{
req.flash('msg','Username already exists!');
return res.redirect('/signup');
}

}
catch(err){
next(err);
}

}