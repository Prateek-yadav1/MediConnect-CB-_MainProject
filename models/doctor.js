const mongoose = require('mongoose');
const { Schema } = mongoose;

const doctorSchema = new Schema({
  name: String,
  specialty: String,
  experience: String,
  image: String,
  about: String,
  specializations: [String]
  // Add more fields as needed
});

module.exports = mongoose.model('Doctor', doctorSchema);