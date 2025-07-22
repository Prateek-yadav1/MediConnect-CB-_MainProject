const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor');
const { isDoctor } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'public/reports/' });

// Doctor list page
router.get('/', doctorController.getDoctors);



// Submit review
router.post('/:id/review', doctorController.postReview);

// Book appointment
router.get('/:id/book', doctorController.showBookForm);
router.post('/:id/book',upload.single('report'), doctorController.postBookForm);

// Dashboard and profile
router.get('/dashboard', isDoctor, doctorController.doctorDashboard);
router.get('/dashboard/profile', isDoctor, doctorController.getDoctorProfile);




// Manage appointments
router.post('/appointment/:id/accept', isDoctor, doctorController.acceptAppointment);
router.post('/appointment/:id/reject', isDoctor, doctorController.rejectAppointment);
router.post('/appointment/:id/enable-video', isDoctor, doctorController.enableVideoAppointment);

// Doctor detail page
router.get('/:id', doctorController.getDoctorById);


module.exports = router;
