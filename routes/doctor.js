const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor');
const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const moment = require('moment');

router.get('/', doctorController.getDoctors);






router.post('/:id/review', async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).send('Doctor not found');
  console.log(req.user.username);
  doctor.reviews.push({
    username: req.user.username,
    rating: req.body.rating,
    comment: req.body.comment
  });
  await doctor.save();
  res.redirect(`/doctor/${doctor._id}`);
});


// Show the book appointment form
router.get('/:id/book', async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).send('Doctor not found');
  res.render('bookAppointment', { doctor });
});

router.post('/:id/book', async (req, res) => {
  if (!req.user) return res.redirect('/login');
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).send('Doctor not found');
  await Appointment.create({
    doctor: doctor._id,
    patient: req.user._id,
    patientName: req.user.username || req.user.name,
    date: req.body.date,
    time: req.body.time,
    reason: req.body.reason
  });
  res.render('doctorDetail', { doctor });
});

// Middleware to check if user is a doctor
function isDoctor(req, res, next) {
  if (req.user && req.user.role === 'doctor') return next();
  res.redirect('/login');
}

// Doctor dashboard route
router.get('/dashboard', isDoctor, async (req, res) => {
  const doctor = await Doctor.findById(req.user.doctorProfile);
  if (!doctor) return res.status(404).send('Doctor profile not found');
  const appointments = await Appointment.find({ doctor: doctor._id }).populate('patient');
  res.render('doctorDashboard', { doctor, appointments });
});

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  res.redirect('/login');
}

router.get('/add', isAdmin, (req, res) => {
  res.render('addDoctor');
});

router.post('/add', isAdmin, async (req, res) => {
  const { name, specialty, experience, image, about, specializations,username,password } = req.body;
  // 1. Create doctor profile
  const doctor = await Doctor.create({
    name,
    specialty,
    experience,
    image,
    about,
    specializations: specializations ? specializations.split(',').map(s => s.trim()) : []
  });
  // 2. Create user for doctor login
  await User.create({
    username,
    password,
    role: 'doctor',
    doctorProfile: doctor._id
  });
  res.redirect('/admin/dashboard');
});

// Doctor detail page
router.get('/:id', async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).send('Doctor not found');
   // Format review dates
  if (doctor.reviews && doctor.reviews.length) {
    doctor.reviews.forEach(review => {
      if (review.createdAt) {
        review.formattedDate = moment(review.createdAt).format('DD MMMM YYYY, h:mm A');
      } else {
        review.formattedDate = '';
      }
    });
  }
  res.render('doctorDetail', { doctor });
});


module.exports = router;