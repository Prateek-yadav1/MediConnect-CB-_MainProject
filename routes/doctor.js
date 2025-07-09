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
  doctor.reviews.push({
    username: req.user.username,
    rating: req.body.rating,
    comment: req.body.comment
  });
  await doctor.save();
  res.redirect(`/doctor/${doctor._id}`);
});


//book appointment form
router.get('/:id/book', doctorController.showBookForm);

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

function isDoctor(req, res, next) {
  if (req.user && req.user.role === 'doctor') return next();
  res.redirect('/login');
}

router.get('/dashboard', isDoctor, doctorController.doctorDashboard);


// Doctor profile page
router.get('/dashboard/profile', isDoctor, async (req, res) => {
      const doctor = await Doctor.findById(req.user.doctorProfile);
    if (!doctor) {
        req.flash('msg', 'Doctor profile not found.');
        return res.redirect('/doctor/dashboard');
    }
    const totalAppointments = await Appointment.countDocuments({ doctor: doctor._id });
    const patientsSeen = await Appointment.distinct('patient', { doctor: doctor._id, status: 'accepted' });
    const upcomingAppointments = await Appointment.countDocuments({
        doctor: doctor._id,
        status: 'accepted',
        date: { $gte: new Date() }
    });
    // Reviews (if you have a Review model)
    let reviews = [];
    try {
        reviews = await Review.find({ doctor: doctor._id }).sort({ date: -1 }).limit(5);
    } catch (e) {}
    res.render('doctorProfile', {
        doctor,
        stats: {
            totalAppointments,
            patientsSeen: patientsSeen.length,
            upcomingAppointments
        },
        reviews
    });
});

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  res.redirect('/login');
}

router.get('/add', isAdmin, (req, res) => {
  res.render('addDoctor');
});

router.post('/add', isAdmin, async (req, res) => {
  const { name, specialty, experience, image, about, specializations,username,email,password } = req.body;
  //1.create doctor profile
  const doctor = await Doctor.create({
    name,
    specialty,
    experience,
    image,
    about,
    specializations: specializations ? specializations.split(',').map(s => s.trim()) : []
  });

  //2.create user credential for doctor login
  await User.create({
    username,
    email,
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


// Accept appointment
router.post('/appointment/:id/accept', isDoctor, async (req, res) => {
    await Appointment.findByIdAndUpdate(req.params.id, { status: 'accepted' });
    res.redirect('/doctor/dashboard');
});

// Reject appointment
router.post('/appointment/:id/reject', isDoctor, async (req, res) => {
    await Appointment.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.redirect('/doctor/dashboard');
});

router.post('/appointment/:id/enable-video', isDoctor, async (req, res) => {
    await Appointment.findByIdAndUpdate(req.params.id, { videoEnabled: true });
    res.redirect('/doctor/dashboard');
});

module.exports = router;