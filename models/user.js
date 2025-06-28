const mongoose=require('mongoose');
const {Schema}=mongoose;


const userSchema=new Schema({
    username:String,
    password:String,
    googleId:String,
    googleAccessToken:String
})

module.exports=mongoose.model('User',userSchema);
