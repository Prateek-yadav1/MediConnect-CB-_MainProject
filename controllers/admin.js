const express = require('express');
const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');

module.exports.getDashboard = async (req, res) => {
  const doctorCount = await Doctor.countDocuments();
  const patientCount = await User.countDocuments({ role: 'patient' });
  const appointmentCount = await Appointment.countDocuments();
  res.render('Admin', {
    stats: { doctorCount, patientCount, appointmentCount }
  });
}

module.exports.getDoctors = async (req, res) => {
  const doctors = await Doctor.find();
  res.render('adminDoctors', { doctors });
}

module.exports.getDoctorById= async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) 
    return res.status(404).send('Doctor not found');
  res.render('adminDoctorDetail', { doctor });
}

module.exports.getDoctorEditForm = async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).send('Doctor not found');
  res.render('editDoctor', { doctor });
}

module.exports.postDoctorEditForm=async (req, res) => {
  const { name, specialty, experience, image, about, specializations, username, email, password } = req.body;
  await Doctor.findByIdAndUpdate(req.params.id, {
    name,
    specialty,
    experience,
    image,
    about,
    specializations: specializations ? specializations.split(',').map(s => s.trim()) : [],
    username,
    email,
    password
  });
  res.redirect(`/admin/doctors/${req.params.id}`);
}

module.exports.postdeleteDoctor = async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.redirect('/admin/doctors');
}

module.exports.postDeleteReview = async (req, res) => {
  const { doctorId, reviewId } = req.params;
  await Doctor.findByIdAndUpdate(
    doctorId,
    { $pull: { reviews: { _id: reviewId } } }
  );
  res.redirect(`/admin/doctors/${doctorId}`);
}