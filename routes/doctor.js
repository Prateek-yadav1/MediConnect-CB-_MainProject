const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor');
const { isAdmin, isDoctor } = require('../middlewares/auth');

// Doctor list page
router.get('/', doctorController.getDoctors);

// Submit review
router.post('/:id/review', doctorController.postReview);

// Book appointment
router.get('/:id/book', doctorController.showBookForm);
router.post('/:id/book', doctorController.postBookForm);

// Dashboard and profile
router.get('/dashboard', isDoctor, doctorController.doctorDashboard);
router.get('/dashboard/profile', isDoctor, doctorController.getDoctorProfile);

// Add new doctor
router.get('/add', isAdmin, doctorController.getAddDoctorForm);
router.post('/add', isAdmin, doctorController.postAddDoctorForm);

// Doctor detail page
router.get('/:id', doctorController.getDoctorById);

// Manage appointments
router.post('/appointment/:id/accept', isDoctor, doctorController.acceptAppointment);
router.post('/appointment/:id/reject', isDoctor, doctorController.rejectAppointment);
router.post('/appointment/:id/enable-video', isDoctor, doctorController.enableVideoAppointment);

module.exports = router;
