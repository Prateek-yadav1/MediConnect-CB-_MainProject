const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  res.redirect('/login');
}

router.get('/dashboard', isAdmin, async (req, res) => {
  const doctorCount = await Doctor.countDocuments();
  const patientCount = await User.countDocuments({ role: 'patient' });
  const appointmentCount = await Appointment.countDocuments();
  res.render('Admin', {
    stats: { doctorCount, patientCount, appointmentCount }
  });
});

//view all doctors
router.get('/doctors', isAdmin, async (req, res) => {
  const doctors = await Doctor.find();
  res.render('adminDoctors', { doctors });
});

router.get('/doctors/:id', isAdmin, async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) 
    return res.status(404).send('Doctor not found');
  res.render('adminDoctorDetail', { doctor });
});

//show edit form
router.get('/doctors/:id/edit', isAdmin, async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).send('Doctor not found');
  res.render('editDoctor', { doctor });
});

router.post('/doctors/:id/edit', isAdmin, async (req, res) => {
  const { name, specialty, experience, image, about, specializations } = req.body;
  await Doctor.findByIdAndUpdate(req.params.id, {
    name,
    specialty,
    experience,
    image,
    about,
    specializations: specializations ? specializations.split(',').map(s => s.trim()) : []
  });
  res.redirect(`/admin/doctors/${req.params.id}`);
});

router.post('/doctors/:id/delete', isAdmin, async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.redirect('/admin/doctors');
});

router.post('/doctors/:doctorId/reviews/:reviewId/delete', isAdmin, async (req, res) => {
  const { doctorId, reviewId } = req.params;
  await Doctor.findByIdAndUpdate(
    doctorId,
    { $pull: { reviews: { _id: reviewId } } }
  );
  res.redirect(`/admin/doctors/${doctorId}`);
});

module.exports = router;