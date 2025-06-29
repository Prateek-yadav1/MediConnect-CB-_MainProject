const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor');
const Doctor = require('../models/doctor');
const User = require('../models/user');

router.get('/', doctorController.getDoctors);

// Show add doctor form (admin only)
router.get('/add', (req, res) => {
  res.render('addDoctor');
});

// Handle add doctor form
router.post('/add', async (req, res) => {
  const { name, specialty, experience, image, about, specializations } = req.body;
  await Doctor.create({
    name,
    specialty,
    experience,
    image,
    about,
    specializations: specializations ? specializations.split(',').map(s => s.trim()) : []
  });
  res.redirect('/home');
});

// Doctor detail page
router.get('/:id', async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).send('Doctor not found');
  res.render('doctorDetail', { doctor });
});

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


module.exports = router;