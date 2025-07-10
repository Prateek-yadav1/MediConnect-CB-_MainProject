const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const adminController = require('../controllers/admin');
const { isAdmin } = require('../middlewares/auth');



router.get('/dashboard', isAdmin,adminController.getDashboard );

//view all doctors
router.get('/doctors', isAdmin,adminController.getDoctors );

router.get('/doctors/:id', isAdmin,adminController.getDoctorById);

//show edit form
router.get('/doctors/:id/edit', isAdmin,adminController.getDoctorEditForm );

router.post('/doctors/:id/edit', isAdmin,adminController.postDoctorEditForm);

router.post('/doctors/:id/delete', isAdmin,adminController.postdeleteDoctor);

router.post('/doctors/:doctorId/reviews/:reviewId/delete', isAdmin,adminController.postDeleteReview);

module.exports = router;