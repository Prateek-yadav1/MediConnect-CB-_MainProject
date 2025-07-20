const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const adminController = require('../controllers/admin');
const { isAdmin } = require('../middlewares/auth');


// View dashboard
router.get('/dashboard', isAdmin, adminController.getDashboard);

// View all doctors
router.get('/doctors', isAdmin, adminController.getDoctors);

// Add new doctor - STATIC first!
router.get('/add', isAdmin, adminController.getAddDoctorForm);
router.post('/add', isAdmin, adminController.postAddDoctorForm);

// ✅ THIS MUST COME LAST
router.get('/doctors/:id', isAdmin, adminController.getDoctorById);

// Show edit form
router.get('/doctors/:id/edit', isAdmin, adminController.getDoctorEditForm);
router.post('/doctors/:id/edit', isAdmin, adminController.postDoctorEditForm);

// Delete doctor
router.post('/doctors/:id/delete', isAdmin, adminController.postdeleteDoctor);

// Delete review
router.post('/doctors/:doctorId/reviews/:reviewId/delete', isAdmin, adminController.postDeleteReview);


module.exports = router;