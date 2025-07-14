const path=require('path')
const express=require('express')
const Doctor = require('../models/doctor');


module.exports.getHomePage = async (req, res) => {
    const { q, specialty, experience, insurance, availability } = req.query;
    let filter = {};

    if (q) {
        filter.$or = [
            { name: new RegExp(q, 'i') },
            { specialty: new RegExp(q, 'i') },
            { experience: new RegExp(q, 'i') }
        ];
    }
    if (specialty) filter.specialty = specialty; 
  if (experience) filter.experience = experience;
    if (insurance) filter.insurance = insurance;
    const doctors = await Doctor.find(filter);
    
   res.render('home', {
        doctors,
        q,
        specialty,
        experience,
        insurance,
        availability
    });
}
