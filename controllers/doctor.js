const Doctor = require('../models/doctor');

module.exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.find({});
  res.render('home', { doctors }); 
};