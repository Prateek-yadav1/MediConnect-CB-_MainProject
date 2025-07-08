const Users=require('../models/user');



module.exports.getSignup = (req,res)=>{
    res.render('signup',{
        msg:req.flash('msg')
    });
}

module.exports.postSignup = async (req,res,next)=>{
    const {email, username,password,role}=req.body;
try{
    let user= await Users.findOne({email})
    if(!user){
        try{
            user= await Users.create({email,username,password,role});
             req.session.email=email;

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