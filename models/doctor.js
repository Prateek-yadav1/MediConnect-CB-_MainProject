const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: String, 
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

const doctorSchema = new mongoose.Schema({
  name: String,
  specialty: String,
  experience: String,
  image: String,
  about: String,
  specializations: [String],
  email: String,       
  password: String, 
  reviews: [reviewSchema]
});

module.exports = mongoose.model('Doctor', doctorSchema);