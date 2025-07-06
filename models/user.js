const mongoose=require('mongoose');
const {Schema}=mongoose;


const userSchema=new Schema({
    username:String,
    password:String,
    role: { type: String, enum: ['doctor', 'patient'], required: true },
    doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    googleId:String,
    googleAccessToken:String,
    reports: [
  {
    title: String,
    date: String,
    fileUrl: String
  }
]
})

module.exports=mongoose.model('User',userSchema);
